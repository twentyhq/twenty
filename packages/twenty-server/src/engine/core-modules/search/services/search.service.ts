import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import { Brackets, ObjectLiteral } from 'typeorm';
import chunk from 'lodash.chunk';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { STANDARD_OBJECTS_BY_PRIORITY_RANK } from 'src/engine/core-modules/search/constants/standard-objects-by-priority-rank';
import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';
import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { RecordsWithObjectMetadataItem } from 'src/engine/core-modules/search/types/records-with-object-metadata-item';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { SearchEdgeDTO } from 'src/engine/core-modules/search/dtos/search-edge.dto';
import { encodeCursorData } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';

type SearchCursor = {
  lastRanks: { tsRankCD: number; tsRank: number } | null;
  lastRecordIdsPerObject: Record<string, string | null>;
};

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Injectable()
export class SearchService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly fileService: FileService,
  ) {}

  async getObjectMetadataItemWithFieldMaps(workspace: Workspace) {
    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspace.id);

    if (currentCacheVersion === undefined) {
      throw new WorkspaceMetadataVersionException(
        `Metadata version not found for workspace ${workspace.id}`,
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspace.id,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new WorkspaceMetadataCacheException(
        `Object metadata map not found for workspace ${workspace.id} and metadata version ${currentCacheVersion}`,
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    return Object.values(objectMetadataMaps.byId);
  }

  async getAllRecordsWithObjectMetadataItems({
    objectMetadataItemWithFieldMaps,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
    searchInput,
    limit,
    filter,
  }: {
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps[];
  } & SearchArgs) {
    const filteredObjectMetadataItems = this.filterObjectMetadataItems({
      objectMetadataItemWithFieldMaps,
      includedObjectNameSingulars: includedObjectNameSingulars ?? [],
      excludedObjectNameSingulars: excludedObjectNameSingulars ?? [],
    });

    const allRecordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[] =
      [];

    const filteredObjectMetadataItemsChunks = chunk(
      filteredObjectMetadataItems,
      OBJECT_METADATA_ITEMS_CHUNK_SIZE,
    );

    for (const objectMetadataItemChunk of filteredObjectMetadataItemsChunks) {
      const recordsWithObjectMetadataItems = await Promise.all(
        objectMetadataItemChunk.map(async (objectMetadataItem) => {
          const repository = await this.twentyORMManager.getRepository(
            objectMetadataItem.nameSingular,
          );

          return {
            objectMetadataItem,
            records: await this.buildSearchQueryAndGetRecords({
              entityManager: repository,
              objectMetadataItem,
              searchTerms: formatSearchTerms(searchInput, 'and'),
              searchTermsOr: formatSearchTerms(searchInput, 'or'),
              limit: limit as number,
              filter: filter ?? ({} as ObjectRecordFilter),
            }),
          };
        }),
      );

      allRecordsWithObjectMetadataItems.push(...recordsWithObjectMetadataItems);
    }

    return allRecordsWithObjectMetadataItems;
  }

  filterObjectMetadataItems({
    objectMetadataItemWithFieldMaps,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
  }: {
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps[];
    includedObjectNameSingulars: string[];
    excludedObjectNameSingulars: string[];
  }) {
    return objectMetadataItemWithFieldMaps.filter(
      ({ nameSingular, isSearchable }) => {
        if (!isSearchable) {
          return false;
        }
        if (excludedObjectNameSingulars.includes(nameSingular)) {
          return false;
        }
        if (includedObjectNameSingulars.length > 0) {
          return includedObjectNameSingulars.includes(nameSingular);
        }

        return true;
      },
    );
  }

  async buildSearchQueryAndGetRecords<Entity extends ObjectLiteral>({
    entityManager,
    objectMetadataItem,
    searchTerms,
    searchTermsOr,
    limit,
    filter,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    objectMetadataItem: ObjectMetadataItemWithFieldMaps;
    searchTerms: string;
    searchTermsOr: string;
    limit: number;
    filter: ObjectRecordFilterInput;
  }) {
    const queryBuilder = entityManager.createQueryBuilder();

    const queryParser = new GraphqlQueryParser(
      objectMetadataItem.fieldsByName,
      objectMetadataItem.fieldsByJoinColumnName,
      generateObjectMetadataMaps([objectMetadataItem]),
    );

    queryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItem.nameSingular,
      filter,
    );

    queryParser.applyDeletedAtToBuilder(queryBuilder, filter);

    const imageIdentifierField =
      this.getImageIdentifierColumn(objectMetadataItem);

    const fieldsToSelect = [
      'id',
      ...this.getLabelIdentifierColumns(objectMetadataItem),
      ...(imageIdentifierField ? [imageIdentifierField] : []),
    ].map((field) => `"${field}"`);

    const searchQuery = isNonEmptyString(searchTerms)
      ? queryBuilder
          .select(fieldsToSelect)
          .addSelect(
            `ts_rank_cd("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`,
            'tsRankCD',
          )
          .addSelect(
            `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`,
            'tsRank',
          )
          .andWhere(
            new Brackets((qb) => {
              qb.where(
                `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTerms)`,
                { searchTerms },
              ).orWhere(
                `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTermsOr)`,
                { searchTermsOr },
              );
            }),
          )
          .orderBy(
            `ts_rank_cd("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`,
            'DESC',
          )
          .addOrderBy(
            `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTermsOr))`,
            'DESC',
          )
          .setParameter('searchTerms', searchTerms)
          .setParameter('searchTermsOr', searchTermsOr)
      : queryBuilder
          .select(fieldsToSelect)
          .addSelect('0', 'tsRankCD')
          .addSelect('0', 'tsRank')
          .andWhere(
            new Brackets((qb) => {
              qb.where(`"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`);
            }),
          );

    searchQuery.take(limit);

    return await searchQuery.getRawMany();
  }

  getLabelIdentifierColumns(
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ) {
    if (!objectMetadataItem.labelIdentifierFieldMetadataId) {
      throw new SearchException(
        'Label identifier field not found',
        SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND,
      );
    }

    const labelIdentifierField =
      objectMetadataItem.fieldsById[
        objectMetadataItem.labelIdentifierFieldMetadataId
      ];

    if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
      return [
        `${labelIdentifierField.name}FirstName`,
        `${labelIdentifierField.name}LastName`,
      ];
    }

    return [
      objectMetadataItem.fieldsById[
        objectMetadataItem.labelIdentifierFieldMetadataId
      ].name,
    ];
  }

  getLabelIdentifierValue(
    record: ObjectRecord,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ): string {
    const labelIdentifierFields =
      this.getLabelIdentifierColumns(objectMetadataItem);

    return labelIdentifierFields.map((field) => record[field]).join(' ');
  }

  getImageIdentifierColumn(
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  ) {
    if (objectMetadataItem.nameSingular === 'company') {
      return 'domainNamePrimaryLinkUrl';
    }

    if (!objectMetadataItem.imageIdentifierFieldMetadataId) {
      return null;
    }

    return objectMetadataItem.fieldsById[
      objectMetadataItem.imageIdentifierFieldMetadataId
    ].name;
  }

  private getImageUrlWithToken(avatarUrl: string, workspaceId: string): string {
    const avatarUrlToken = this.fileService.encodeFileToken({
      workspaceId,
    });

    return `${avatarUrl}?token=${avatarUrlToken}`;
  }

  getImageIdentifierValue(
    record: ObjectRecord,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    workspaceId: string,
  ): string {
    const imageIdentifierField =
      this.getImageIdentifierColumn(objectMetadataItem);

    if (objectMetadataItem.nameSingular === 'company') {
      return getLogoUrlFromDomainName(record.domainNamePrimaryLinkUrl) || '';
    }

    return imageIdentifierField
      ? this.getImageUrlWithToken(record[imageIdentifierField], workspaceId)
      : '';
  }

  computeEndCursor({
    sortedRecords,
    limit,
  }: {
    sortedRecords: SearchEdgeDTO[];
    limit: number;
  }) {
    const lastRecord = sortedRecords[sortedRecords.length - 1];

    if (!lastRecord) {
      return { endCursor: null, hasNextPage: false };
    }

    const lastRecordIdsPerObject: Record<string, string | null> = {};

    const objectSeen: Set<string> = new Set();

    let lastRanks: { tsRankCD: number; tsRank: number } | null = null;

    let hasNextPage = false;

    sortedRecords.forEach((record, index) => {
      const { objectNameSingular, tsRankCD, tsRank, recordId } = record.node;

      if (index < limit) {
        lastRanks = { tsRankCD, tsRank };
        lastRecordIdsPerObject[objectNameSingular] = recordId;
        objectSeen.add(objectNameSingular);
      } else if (!objectSeen.has(objectNameSingular)) {
        lastRecordIdsPerObject[objectNameSingular] = null;
        hasNextPage = true;
      }
    });

    return {
      endCursor: hasNextPage
        ? encodeCursorData({
            lastRanks,
            lastRecordIdsPerObject: lastRecordIdsPerObject,
          })
        : null,
      hasNextPage,
    };
  }

  computeSearchObjectResults(
    recordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[],
    workspaceId: string,
    limit: number,
  ): {
    records: SearchEdgeDTO[];
    endCursor: string | null;
    hasNextPage: boolean;
  } {
    const searchRecords = recordsWithObjectMetadataItems.flatMap(
      ({ objectMetadataItem, records }) => {
        return records.map((record) => {
          return {
            node: {
              recordId: record.id,
              objectNameSingular: objectMetadataItem.nameSingular,
              label: this.getLabelIdentifierValue(record, objectMetadataItem),
              imageUrl: this.getImageIdentifierValue(
                record,
                objectMetadataItem,
                workspaceId,
              ),
              tsRankCD: record.tsRankCD,
              tsRank: record.tsRank,
            },
            cursor: null,
          };
        });
      },
    );

    const sortedRecords = this.sortSearchObjectResults(searchRecords);

    const { endCursor, hasNextPage } = this.computeEndCursor({
      sortedRecords: searchRecords,
      limit,
    });

    const sortedSlicedRecords =
      limit !== undefined ? sortedRecords.slice(0, limit) : sortedRecords;

    return { records: sortedSlicedRecords, endCursor, hasNextPage };
  }

  sortSearchObjectResults(searchObjectResultsWithRank: SearchEdgeDTO[]) {
    return searchObjectResultsWithRank.sort((a, b) => {
      if (a.node.tsRankCD !== b.node.tsRankCD) {
        return b.node.tsRankCD - a.node.tsRankCD;
      }

      if (a.node.tsRank !== b.node.tsRank) {
        return b.node.tsRank - a.node.tsRank;
      }

      return (
        // @ts-expect-error legacy noImplicitAny
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[b.node.objectNameSingular] || 0) -
        // @ts-expect-error legacy noImplicitAny
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[a.node.objectNameSingular] || 0)
      );
    });
  }
}
