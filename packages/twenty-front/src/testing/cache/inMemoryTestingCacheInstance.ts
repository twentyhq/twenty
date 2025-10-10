import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache, type NormalizedCacheObject } from '@apollo/client';

import { isDefined } from 'twenty-shared/utils';

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
type InMemoryTestingCacheInstanceArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  initialRecordsInCache?: RecordsWithObjectMetadataItem;
};

export class InMemoryTestingCacheInstance {
  private _cache: InMemoryCache;
  private objectMetadataItems: ObjectMetadataItem[];
  private initialStateExtract: NormalizedCacheObject;

  constructor({
    objectMetadataItems,
    initialRecordsInCache = [],
  }: InMemoryTestingCacheInstanceArgs) {
    this.objectMetadataItems = objectMetadataItems;
    this._cache = new InMemoryCache();

    this.populateRecordsInCache(initialRecordsInCache);
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
          recordGqlFields: generateDepthRecordGqlFieldsFromRecord({
            objectMetadataItems: this.objectMetadataItems,
            depth: 1,
            objectMetadataItem,
            record,
          }),
          objectPermissionsByObjectMetadataId: {},
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
      objectPermissionsByObjectMetadataId: {},
    });
    expect(cachedRecord).toBeNull();
  };

  public assertCachedRecordMatchSnapshot = ({
    objectMetadataItem,
    recordId,
    matchObject,
    snapshotPropertyMatchers,
  }: GetMockCachedRecord) => {
    const cachedRecord = getRecordFromCache({
      cache: this._cache,
      objectMetadataItem,
      objectMetadataItems: this.objectMetadataItems,
      recordId,
      objectPermissionsByObjectMetadataId: {},
    });
    expect(cachedRecord).not.toBeNull();

    if (cachedRecord === null) {
      throw new Error('Should never occurs, cachedRecord is null');
    }

    if (isDefined(matchObject)) {
      expect(cachedRecord).toMatchObject(matchObject);
    }
    expect(cachedRecord).toMatchSnapshot(snapshotPropertyMatchers ?? {});
  };

  public restoreCacheToInitialState = async () => {
    return this._cache.restore(this.initialStateExtract);
  };

  public get cache() {
    return this._cache;
  }
}
