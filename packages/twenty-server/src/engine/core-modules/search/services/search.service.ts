import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { FieldMetadataType } from 'twenty-shared/types';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import { Brackets, ObjectLiteral } from 'typeorm';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { STANDARD_OBJECTS_BY_PRIORITY_RANK } from 'src/engine/core-modules/search/constants/standard-objects-by-priority-rank';
import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';
import { SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record.dto';
import { SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';
import { SearchResultEdgeDTO } from 'src/engine/core-modules/search/dtos/search-result-edge.dto';
import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { RecordsWithObjectMetadataItem } from 'src/engine/core-modules/search/types/records-with-object-metadata-item';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';

type LastRanks = { tsRankCD: number; tsRank: number };

export type SearchCursor = {
  lastRanks: LastRanks;
  lastRecordIdsPerObject: Record<string, string | undefined>;
};

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Injectable()
export class SearchService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly fileService: FileService,
  ) {}

  async getAllRecordsWithObjectMetadataItems({
    objectMetadataItemWithFieldMaps,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
    searchInput,
    limit,
    filter,
    after,
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
          const repository =
            await this.twentyORMManager.getRepository<ObjectRecord>(
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
              after,
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
    after,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    objectMetadataItem: ObjectMetadataItemWithFieldMaps;
    searchTerms: string;
    searchTermsOr: string;
    limit: number;
    filter: ObjectRecordFilterInput;
    after?: string;
  }) {
    const queryBuilder = entityManager.createQueryBuilder();

    const queryParser = new GraphqlQueryParser(
      objectMetadataItem,
      generateObjectMetadataMaps([
        {
          ...objectMetadataItem,
          fields: Object.values(objectMetadataItem.fieldsById),
        },
      ]),
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

    const tsRankCDExpr = `ts_rank_cd("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTerms))`;

    const tsRankExpr = `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery(:searchTermsOr))`;

    const cursorWhereCondition = this.computeCursorWhereCondition({
      after,
      objectMetadataNameSingular: objectMetadataItem.nameSingular,
      tsRankExpr,
      tsRankCDExpr,
    });

    queryBuilder
      .select(fieldsToSelect)
      .addSelect(tsRankCDExpr, 'tsRankCD')
      .addSelect(tsRankExpr, 'tsRank');

    if (isNonEmptyString(searchTerms)) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(
            `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTerms)`,
            { searchTerms },
          ).orWhere(
            `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', :searchTermsOr)`,
            { searchTermsOr },
          );
        }),
      );
    } else {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(`"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`);
        }),
      );
    }

    if (cursorWhereCondition) {
      queryBuilder.andWhere(cursorWhereCondition);
    }

    return await queryBuilder
      .orderBy(tsRankCDExpr, 'DESC')
      .addOrderBy(tsRankExpr, 'DESC')
      .addOrderBy('id', 'ASC', 'NULLS FIRST')
      .setParameter('searchTerms', searchTerms)
      .setParameter('searchTermsOr', searchTermsOr)
      .take(limit + 1) // We take one more to check if hasNextPage is true
      .getRawMany();
  }

  computeCursorWhereCondition({
    after,
    objectMetadataNameSingular,
    tsRankExpr,
    tsRankCDExpr,
  }: {
    after?: string;
    objectMetadataNameSingular: string;
    tsRankExpr: string;
    tsRankCDExpr: string;
  }) {
    if (after) {
      const { lastRanks, lastRecordIdsPerObject } =
        decodeCursor<SearchCursor>(after);

      const lastRecordId = lastRecordIdsPerObject[objectMetadataNameSingular];

      return new Brackets((qb) => {
        qb.where(`${tsRankCDExpr} < :tsRankCDLt`, {
          tsRankCDLt: lastRanks.tsRankCD,
        })
          .orWhere(
            new Brackets((inner) => {
              inner.andWhere(`${tsRankCDExpr} = :tsRankCDEq`, {
                tsRankCDEq: lastRanks.tsRankCD,
              });
              inner.andWhere(`${tsRankExpr} < :tsRankLt`, {
                tsRankLt: lastRanks.tsRank,
              });
            }),
          )
          .orWhere(
            new Brackets((inner) => {
              inner.andWhere(`${tsRankCDExpr} = :tsRankCDEq`, {
                tsRankCDEq: lastRanks.tsRankCD,
              });
              inner.andWhere(`${tsRankExpr} = :tsRankEq`, {
                tsRankEq: lastRanks.tsRank,
              });
              if (lastRecordId !== undefined) {
                inner.andWhere('id > :lastRecordId', { lastRecordId });
              }
            }),
          );
      });
    }
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
    return this.fileService.signFileUrl({
      url: avatarUrl,
      workspaceId,
    });
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

    return imageIdentifierField &&
      isNonEmptyString(record[imageIdentifierField])
      ? this.getImageUrlWithToken(record[imageIdentifierField], workspaceId)
      : '';
  }

  computeEdges({
    sortedRecords,
    after,
  }: {
    sortedRecords: SearchRecordDTO[];
    after?: string;
  }): SearchResultEdgeDTO[] {
    const recordEdges = [];

    const lastRecordIdsPerObject = after
      ? {
          ...decodeCursor<SearchCursor>(after).lastRecordIdsPerObject,
        }
      : {};

    for (const record of sortedRecords) {
      const { objectNameSingular, tsRankCD, tsRank, recordId } = record;

      lastRecordIdsPerObject[objectNameSingular] = recordId;

      const lastRecordIdsPerObjectSnapshot = { ...lastRecordIdsPerObject };

      recordEdges.push({
        node: record,
        cursor: encodeCursorData({
          lastRanks: {
            tsRankCD,
            tsRank,
          },
          lastRecordIdsPerObject: lastRecordIdsPerObjectSnapshot,
        }),
      });
    }

    return recordEdges;
  }

  computeSearchObjectResults({
    recordsWithObjectMetadataItems,
    workspaceId,
    limit,
    after,
  }: {
    recordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[];
    workspaceId: string;
    limit: number;
    after?: string;
  }): SearchResultConnectionDTO {
    const searchRecords = recordsWithObjectMetadataItems.flatMap(
      ({ objectMetadataItem, records }) => {
        return records.map((record) => {
          return {
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
          };
        });
      },
    );

    const sortedRecords = this.sortSearchObjectResults(searchRecords).slice(
      0,
      limit,
    );

    const hasNextPage = searchRecords.length > limit;

    const recordEdges = this.computeEdges({ sortedRecords, after });

    if (recordEdges.length === 0) {
      return { edges: [], pageInfo: { endCursor: null, hasNextPage } };
    }

    const lastRecordEdge = recordEdges[recordEdges.length - 1];

    return {
      edges: recordEdges,
      pageInfo: { endCursor: lastRecordEdge.cursor, hasNextPage },
    };
  }

  sortSearchObjectResults(searchObjectResultsWithRank: SearchRecordDTO[]) {
    return searchObjectResultsWithRank.sort((a, b) => {
      if (a.tsRankCD !== b.tsRankCD) {
        return b.tsRankCD - a.tsRankCD;
      }

      if (a.tsRank !== b.tsRank) {
        return b.tsRank - a.tsRank;
      }

      return (
        // @ts-expect-error legacy noImplicitAny
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[b.objectNameSingular] || 0) -
        // @ts-expect-error legacy noImplicitAny
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[a.objectNameSingular] || 0)
      );
    });
  }
}
