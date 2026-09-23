import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';

const share = {
  objectMetadataId: 'object',
  recordId: 'record',
  principalId: 'member',
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.READ,
  sourceId: 'record',
};

const buildService = () => {
  let rows: RecordShareInput[] = [
    { ...share, rowCause: RecordShareRowCause.OWNER },
    {
      ...share,
      sourceId: 'application',
      rowCause: RecordShareRowCause.APPLICATION,
    },
  ];
  const repository = {
    delete: jest
      .fn()
      .mockImplementation(async (where: Partial<RecordShareInput>) => {
        rows = rows.filter(
          (row) =>
            !Object.entries(where).every(
              ([key, value]) => row[key as keyof RecordShareInput] === value,
            ),
        );
      }),
    insert: jest.fn().mockImplementation(async (row: RecordShareInput) => {
      rows.push(row);
    }),
  };
  const scope = {
    workspaceId: 'workspace',
    getRepository: () => repository,
    executeRawQuery: jest.fn(),
  };
  const manager = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((work: () => Promise<void>) => work()),
    runInWorkspaceTransaction: jest
      .fn()
      .mockImplementation(async (work: (scope: unknown) => Promise<void>) => {
        const before = [...rows];
        try {
          await work(scope);
        } catch (error) {
          rows = before;
          throw error;
        }
      }),
  };
  return {
    service: new RecordShareStorageService(manager as never),
    repository,
    rows: () => rows,
    scope,
  };
};

describe('Manual record share management', () => {
  it('is idempotent and preserves owner and application grants', async () => {
    const { service, rows } = buildService();
    await service.setManualShare({
      workspaceId: 'workspace',
      share,
      enabled: true,
    });
    await service.setManualShare({
      workspaceId: 'workspace',
      share,
      enabled: true,
    });
    expect(rows()).toHaveLength(3);
    await service.setManualShare({
      workspaceId: 'workspace',
      share,
      enabled: false,
    });
    expect(rows().map((row) => row.rowCause)).toEqual([
      RecordShareRowCause.OWNER,
      RecordShareRowCause.APPLICATION,
    ]);
  });

  it('revokes manual grants regardless of their author without touching another record', async () => {
    const { service, rows } = buildService();
    await service.setManualShare({
      workspaceId: 'workspace',
      share,
      enabled: true,
    });
    await service.setManualShare({
      workspaceId: 'workspace',
      share: { ...share, recordId: 'another-record' },
      enabled: true,
    });
    await service.setManualShare({
      workspaceId: 'workspace',
      share: { ...share, sourceId: 'another-source' },
      enabled: false,
    });
    expect(rows()).toHaveLength(3);
  });

  it('rolls back replacement if the insert fails', async () => {
    const { service, rows, repository } = buildService();
    await service.setManualShare({
      workspaceId: 'workspace',
      share,
      enabled: true,
    });
    repository.insert.mockRejectedValueOnce(new Error('write failed'));
    await expect(
      service.setManualShare({
        workspaceId: 'workspace',
        share,
        enabled: true,
      }),
    ).rejects.toThrow('write failed');
    expect(rows()).toHaveLength(3);
  });
});
