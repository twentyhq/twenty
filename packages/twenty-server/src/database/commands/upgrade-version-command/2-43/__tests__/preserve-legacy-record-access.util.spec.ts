import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  MetadataReadability,
  MetadataWritability,
} from 'twenty-shared/types';
import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const objects = [
  {
    ...COMPANY_FLAT_OBJECT_MOCK,
    id: 'thread',
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  },
  {
    ...COMPANY_FLAT_OBJECT_MOCK,
    id: 'private',
    universalIdentifier: 'private-object',
    nameSingular: 'privateRecord',
    isCustom: true,
  },
] as FlatObjectMetadata[];
const buildLegacyObjectAccess = ({
  threadReadability = MetadataReadability.SYSTEM,
  privateReadability = MetadataReadability.PRIVATE,
}: {
  threadReadability?: MetadataReadability;
  privateReadability?: MetadataReadability;
} = {}) => [
  {
    id: 'thread',
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    readability: threadReadability,
    writability: MetadataWritability.SYSTEM,
    readabilityParentFieldUniversalIdentifiers: null,
  },
  {
    id: 'private',
    universalIdentifier: 'private-object',
    readability: privateReadability,
    writability: MetadataWritability.OPEN,
    readabilityParentFieldUniversalIdentifiers: null,
  },
];
const args = {
  workspaceId: WORKSPACE_ID,
  objects,
  wasRecordSharingEnabled: false,
};

it('keyset-batches managed compatibility grants and marks completion last', async () => {
  const query = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(buildLegacyObjectAccess())
    .mockResolvedValueOnce([{ id: 'last' }])
    .mockResolvedValueOnce([{ lastId: 'batch-end', count: 10000 }])
    .mockResolvedValueOnce([{ lastId: 'last', count: 2 }])
    .mockResolvedValueOnce([]);
  await preserveLegacyRecordAccess({ ...args, manager: { query } as never });
  expect(query).toHaveBeenCalledTimes(6);
  expect(query.mock.calls[3][0]).toContain(
    "'EVERYONE', 'FULL', 'APPLICATION', $1::uuid",
  );
  expect(query.mock.calls[3][0]).toContain('LIMIT 10000');
  expect(query.mock.calls[4][1][2]).toBe('batch-end');
  expect(query.mock.calls[5][0]).toContain('INSERT INTO core."keyValuePair"');
});

it('does not mark a partially completed backfill', async () => {
  const query = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(buildLegacyObjectAccess())
    .mockResolvedValueOnce([{ id: 'last' }])
    .mockRejectedValueOnce(new Error('storage failed'));
  await expect(
    preserveLegacyRecordAccess({ ...args, manager: { query } as never }),
  ).rejects.toThrow('storage failed');
  expect(
    query.mock.calls.some(([sql]) =>
      sql.includes('INSERT INTO core."keyValuePair"'),
    ),
  ).toBe(false);
});

it('never backfills records after an already-completed decision', async () => {
  const query = jest.fn().mockResolvedValue([{ id: 'completed' }]);
  await preserveLegacyRecordAccess({ ...args, manager: { query } as never });
  expect(query).toHaveBeenCalledTimes(1);
});

it.each([
  { wasRecordSharingEnabled: true, threadReadability: undefined },
  {
    wasRecordSharingEnabled: false,
    threadReadability: MetadataReadability.PRIVATE,
  },
])(
  'marks a no-op for previously enabled sharing or an upgraded workspace (%o)',
  async ({ wasRecordSharingEnabled, threadReadability }) => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(buildLegacyObjectAccess({ threadReadability }))
      .mockResolvedValueOnce([]);
    await preserveLegacyRecordAccess({
      ...args,
      manager: { query } as never,
      wasRecordSharingEnabled,
    });
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[2][0]).toContain('INSERT INTO core."keyValuePair"');
  },
);

it('backfills existing private objects even when chat metadata is absent', async () => {
  const query = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(buildLegacyObjectAccess().slice(1))
    .mockResolvedValueOnce([{ id: 'last' }])
    .mockResolvedValueOnce([{ lastId: 'last', count: 1 }])
    .mockResolvedValueOnce([]);
  await preserveLegacyRecordAccess({
    ...args,
    objects: [objects[1]],
    manager: { query } as never,
  });
  expect(query.mock.calls[3][0]).toContain("'EVERYONE', 'FULL', 'APPLICATION'");
  expect(query.mock.calls[4][0]).toContain('INSERT INTO core."keyValuePair"');
});
