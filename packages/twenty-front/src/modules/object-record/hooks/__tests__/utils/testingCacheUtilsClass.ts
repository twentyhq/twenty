import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
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
  matchObject?: ObjectRecord;
};

type CacheUtilsArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  recordsTopPopulateInCache?: RecordsWithObjectMetadataItem;
};

export class CacheUtils {
  private _cache: InMemoryCache;
  private objectMetadataItems: ObjectMetadataItem[];
  private initialStateExtract: NormalizedCacheObject;

  constructor({
    objectMetadataItems,
    recordsTopPopulateInCache = [],
  }: CacheUtilsArgs) {
    this.objectMetadataItems = objectMetadataItems;
    this._cache = new InMemoryCache();

    this.populateRecordsInCache(recordsTopPopulateInCache);
    this.initialStateExtract = this._cache.extract();
  }

  public populateRecordsInCache = (
    recordsWithObjectMetadataItem: RecordsWithObjectMetadataItem,
  ) => {
    recordsWithObjectMetadataItem.forEach(({ objectMetadataItem, records }) =>
      records.forEach((record) =>
        updateRecordFromCache({
          cache: this._cache,
          objectMetadataItem,
          objectMetadataItems: this.objectMetadataItems,
          record,
          recordGqlFields: generateDepthOneRecordGqlFields({
            objectMetadataItem,
            record,
          }),
        }),
      ),
    );
  };

  public assertCachedRecordIsNull = ({
    objectMetadataItem,
    recordId,
  }: ObjectMetadataItemAndRecordId) => {
    const cachedRecord = getRecordFromCache({
      cache: this._cache,
      objectMetadataItem,
      objectMetadataItems: this.objectMetadataItems,
      recordId,
    });
    expect(cachedRecord).toBeNull();
  };

  public assertCachedRecordMatchSnapshot = ({
    objectMetadataItem,
    recordId,
    matchObject,
  }: GetMockCachedRecord) => {
    const cachedRecord = getRecordFromCache({
      cache: this._cache,
      objectMetadataItem,
      objectMetadataItems: this.objectMetadataItems,
      recordId,
    });
    expect(cachedRecord).not.toBeNull();

    if (cachedRecord === null) {
      throw new Error('Should never occurs, cachedRecord is null');
    }

    if (matchObject) {
      expect(cachedRecord).toMatchObject(matchObject);
    }
    expect(cachedRecord).toMatchSnapshot();
  };

  public restoreCacheToInitialState = async () => {
    return this._cache.restore(this.initialStateExtract);
  };

  public get cache() {
    return this._cache;
  }
}
