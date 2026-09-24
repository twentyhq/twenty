import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const objects = [
  {
    ...COMPANY_FLAT_OBJECT_MOCK,
    id: 'thread',
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    readability: MetadataReadability.SYSTEM,
  },
  {
    ...COMPANY_FLAT_OBJECT_MOCK,
    id: 'private',
    nameSingular: 'privateRecord',
    isCustom: true,
    readability: MetadataReadability.PRIVATE,
  },
] as FlatObjectMetadata[];
const args = {
  workspaceId: WORKSPACE_ID,
  objects,
  wasRecordSharingEnabled: false,
};

it('keyset-batches managed compatibility grants and marks completion last', async () => {
  const query = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id: 'last' }])
    .mockResolvedValueOnce([{ lastId: 'batch-end', count: 10000 }])
    .mockResolvedValueOnce([{ lastId: 'last', count: 2 }])
    .mockResolvedValueOnce([]);
  await preserveLegacyRecordAccess({ ...args, manager: { query } as never });
  expect(query).toHaveBeenCalledTimes(5);
  expect(query.mock.calls[2][0]).toContain(
    "'EVERYONE', 'FULL', 'APPLICATION', $1::uuid",
  );
  expect(query.mock.calls[2][0]).toContain('LIMIT 10000');
  expect(query.mock.calls[3][1][2]).toBe('batch-end');
  expect(query.mock.calls[4][0]).toContain('INSERT INTO core."keyValuePair"');
});

it('does not mark a partially completed backfill', async () => {
  const query = jest
    .fn()
    .mockResolvedValueOnce([])
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

it.each([true, false])(
  'marks a no-op for previously enabled sharing or a fresh workspace (%s)',
  async (enabled) => {
    const query = jest.fn().mockResolvedValue([]);
    await preserveLegacyRecordAccess({
      ...args,
      manager: { query } as never,
      wasRecordSharingEnabled: enabled,
      objects: enabled
        ? objects
        : objects.map((object) => ({
            ...object,
            readability: MetadataReadability.PRIVATE,
          })),
    });
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('INSERT INTO core."keyValuePair"');
  },
);
