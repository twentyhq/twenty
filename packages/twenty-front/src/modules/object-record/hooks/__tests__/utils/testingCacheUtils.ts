import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache } from '@apollo/client';
import { expect } from '@storybook/jest';

type ObjectMetadataItemAndRecordId = {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;
};
type RecordsWithObjectMetadataItem = {
  records: ObjectRecord[];
  objectMetadataItem: ObjectMetadataItem;
}[];

type GetMockCachedRecord = {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;
  matchObject?: Record<string, unknown>;
  snapshotPropertyMatchers?: {
    deletedAt?: any;
    updatedAt?: any;
    createdAt?: any;
  };
};
type GetCacheUtilsArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  recordsTopPopulateInCache?: RecordsWithObjectMetadataItem;
};
export const buildCacheUtils = ({
  objectMetadataItems,
  recordsTopPopulateInCache = [],
}: GetCacheUtilsArgs) => {
  const populateRecordsInCache = (
    recordsWithObjectMetadataItem: RecordsWithObjectMetadataItem,
  ) => {
    recordsWithObjectMetadataItem.forEach(({ objectMetadataItem, records }) =>
      records.forEach((record) =>
        updateRecordFromCache({
          cache,
          objectMetadataItem,
          objectMetadataItems,
          record,
          recordGqlFields: computeDepthOneRecordGqlFieldsFromRecord({
            objectMetadataItem,
            record,
          }),
        }),
      ),
    );
  };
  const assertCachedRecordIsNull = ({
    objectMetadataItem,
    recordId,
  }: ObjectMetadataItemAndRecordId) => {
    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId,
    });
    expect(cachedRecord).toBeNull();
  };

  const assertCachedRecordMatchSnapshot = ({
    objectMetadataItem,
    recordId,
    matchObject,
    snapshotPropertyMatchers,
  }: GetMockCachedRecord) => {
    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId,
    });
    expect(cachedRecord).not.toBeNull();
    if (cachedRecord === null) {
      throw new Error('Should never occurs, cachedRecord is null');
    }

    if (matchObject) {
      expect(cachedRecord).toMatchObject(matchObject);
    }
    expect(cachedRecord).toMatchSnapshot(snapshotPropertyMatchers ?? {});
  };

  const cache = new InMemoryCache();
  populateRecordsInCache(recordsTopPopulateInCache);
  const initialStateExtract = cache.extract();
  cache.reset;
  const restoreCacheToInitialState = async () => {
    cache.restore(initialStateExtract);
  };

  return {
    assertCachedRecordIsNull,
    assertCachedRecordMatchSnapshot,
    restoreCacheToInitialState,
    populateRecordsInCache,
    cache,
  };
};
