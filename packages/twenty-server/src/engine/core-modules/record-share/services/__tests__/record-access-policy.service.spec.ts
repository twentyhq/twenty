import { Test } from '@nestjs/testing';
import {
  MetadataReadability,
  RecordShareRowCause,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const setup = async ({
  rowCause,
  legacyOpen = false,
}: { rowCause?: RecordShareRowCause; legacyOpen?: boolean } = {}) => {
  const module = await Test.createTestingModule({
    providers: [
      RecordAccessPolicyService,
      { provide: WorkspaceOrmManager, useValue: {} },
      { provide: WorkspaceCacheService, useValue: {} },
      {
        provide: RecordSharingFeatureService,
        useValue: {
          isLegacyRecordAccessOpen: jest.fn().mockResolvedValue(legacyOpen),
        },
      },
      {
        provide: RecordShareStorageService,
        useValue: {
          findByRecordIds: jest.fn().mockResolvedValue(
            rowCause
              ? [
                  {
                    recordId: 'record',
                    principalId: 'member',
                    rowCause,
                    accessLevel: RecordShareAccessLevel.FULL,
                  },
                ]
              : [],
          ),
        },
      },
    ],
  }).compile();
  const gate = (readability: MetadataReadability) =>
    module.get(RecordAccessPolicyService).buildEventRecordAccessGate({
      name: 'company.created',
      workspaceId: COMPANY_FLAT_OBJECT_MOCK.workspaceId,
      objectMetadata: { ...COMPANY_FLAT_OBJECT_MOCK, readability },
      events: [{ recordId: 'record', properties: { after: { id: 'record' } } }],
    });
  return { module, gate };
};

const subject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: ['member'],
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

describe('mandatory event visibility', () => {
  it('resolves rollout access once per batch across concurrent subscribers', async () => {
    const { module, gate } = await setup({
      rowCause: RecordShareRowCause.OWNER,
    });
    const eventGate = gate(MetadataReadability.PRIVATE);
    const admitted = await Promise.all([
      eventGate.resolveAdmittedRecordIds(subject),
      eventGate.resolveAdmittedRecordIds({
        ...subject,
        principalIds: ['other-member'],
      }),
    ]);
    expect(admitted).toEqual([new Set(['record']), new Set()]);
    expect(
      module.get(RecordSharingFeatureService).isLegacyRecordAccessOpen,
    ).toHaveBeenCalledTimes(1);
    await gate(MetadataReadability.PRIVATE).resolveAdmittedRecordIds(subject);
    expect(
      module.get(RecordSharingFeatureService).isLegacyRecordAccessOpen,
    ).toHaveBeenCalledTimes(2);
    await module.close();
  });

  it.each([true, false])(
    'denies SYSTEM records with owning application=%s',
    async (isOwningApplication) => {
      const { module, gate } = await setup();
      expect(
        await gate(MetadataReadability.SYSTEM).resolveAdmittedRecordIds({
          ...subject,
          isOwningApplication: () => isOwningApplication,
        }),
      ).toEqual(new Set());
      await module.close();
    },
  );

  it.each([
    RecordShareRowCause.OWNER,
    RecordShareRowCause.APPLICATION,
    RecordShareRowCause.MANUAL,
  ])('honors %s grants after metadata activation', async (rowCause) => {
    const { module, gate } = await setup({ rowCause });
    expect(
      await gate(MetadataReadability.PRIVATE).resolveAdmittedRecordIds(subject),
    ).toEqual(new Set(['record']));
    await module.close();
  });

  it.each([true, false])(
    'uses the resolved legacy-access decision (%s) for unshared events',
    async (legacyOpen) => {
      const { module, gate } = await setup({ legacyOpen });
      expect(
        await gate(MetadataReadability.PRIVATE).resolveAdmittedRecordIds(
          subject,
        ),
      ).toEqual(new Set(legacyOpen ? ['record'] : []));
      await module.close();
    },
  );
});
