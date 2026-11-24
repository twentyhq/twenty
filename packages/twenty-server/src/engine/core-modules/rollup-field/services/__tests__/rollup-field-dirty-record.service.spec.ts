import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RollupFieldDirtyRecordService } from 'src/engine/core-modules/rollup-field/services/rollup-field-dirty-record.service';

const createInMemoryCacheStorage = () => {
  const sets = new Map<string, Set<string>>();
  const getSet = (key: string) => {
    if (!sets.has(key)) {
      sets.set(key, new Set());
    }

    return sets.get(key) as Set<string>;
  };

  return {
    setAdd: async (key: string, values: string[]) => {
      values.forEach((value) => getSet(key).add(value));
    },
    setPop: async (key: string, size: number) => {
      const popped = [...getSet(key)].slice(0, size);

      popped.forEach((value) => getSet(key).delete(value));

      return popped;
    },
    setMembers: async (key: string) => [...getSet(key)],
    setRemove: async (key: string, values: string[]) => {
      values.forEach((value) => getSet(key).delete(value));

      return values.length;
    },
    del: async (key: string) => {
      sets.delete(key);
    },
    acquireLock: async () => 'marker',
  } as unknown as CacheStorageService;
};

const JOB_DATA = { workspaceId: 'workspace-id', objectMetadataId: 'object-id' };

describe('RollupFieldDirtyRecordService', () => {
  let service: RollupFieldDirtyRecordService;

  beforeEach(() => {
    service = new RollupFieldDirtyRecordService(createInMemoryCacheStorage(), {
      add: jest.fn(),
    } as unknown as MessageQueueService);
  });

  it('hands popped ids to the next run when a run dies before completing', async () => {
    await service.markRecordsDirty({ ...JOB_DATA, recordIds: ['a', 'b'] });

    expect(
      (await service.popDirtyRecordIds({ ...JOB_DATA, size: 10 })).sort(),
    ).toEqual(['a', 'b']);

    expect(
      (await service.popDirtyRecordIds({ ...JOB_DATA, size: 10 })).sort(),
    ).toEqual(['a', 'b']);
  });

  it('does not hand completed ids to the next run', async () => {
    await service.markRecordsDirty({ ...JOB_DATA, recordIds: ['a', 'b'] });

    const recordIds = await service.popDirtyRecordIds({
      ...JOB_DATA,
      size: 10,
    });

    await service.completeDirtyRecordIds({ ...JOB_DATA, recordIds });

    expect(await service.popDirtyRecordIds({ ...JOB_DATA, size: 10 })).toEqual(
      [],
    );
  });

  it('keeps an id marked dirty again while it was being recomputed', async () => {
    await service.markRecordsDirty({ ...JOB_DATA, recordIds: ['a'] });

    const recordIds = await service.popDirtyRecordIds({
      ...JOB_DATA,
      size: 10,
    });

    await service.markRecordsDirty({ ...JOB_DATA, recordIds: ['a'] });
    await service.completeDirtyRecordIds({ ...JOB_DATA, recordIds });

    expect(await service.popDirtyRecordIds({ ...JOB_DATA, size: 10 })).toEqual([
      'a',
    ]);
  });
});
