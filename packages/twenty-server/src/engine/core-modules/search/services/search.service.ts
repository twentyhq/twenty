import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { FieldMetadataType, ObjectRecord } from 'twenty-shared/types';
import { getLogoUrlFromDomainName, isDefined } from 'twenty-shared/utils';
import { Brackets, type ObjectLiteral } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { STANDARD_OBJECTS_BY_PRIORITY_RANK } from 'src/engine/core-modules/search/constants/standard-objects-by-priority-rank';
import { type ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';
import { type SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { type SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record.dto';
import { type SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';
import { type SearchResultEdgeDTO } from 'src/engine/core-modules/search/dtos/search-result-edge.dto';
import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { type RecordsWithObjectMetadataItem } from 'src/engine/core-modules/search/types/records-with-object-metadata-item';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

type LastRanks = { tsRankCD: number; tsRank: number };

export type SearchCursor = {
  lastRanks: LastRanks;
  lastRecordIdsPerObject: Record<string, string | undefined>;
};

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Injectable()
export class SearchService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileService: FileService,
  ) {}

  async getAllRecordsWithObjectMetadataItems({
    flatObjectMetadatas,
    flatFieldMetadataMaps,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
    searchInput,
    limit,
    filter,
    after,
    workspaceId,
    rolePermissionConfig,
  }: {
    flatObjectMetadatas: FlatObjectMetadata[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
    rolePermissionConfig?: RolePermissionConfig;
  } & SearchArgs) {
    const filteredObjectMetadataItems = this.filterObjectMetadataItems({
      flatObjectMetadatas,
      includedObjectNameSingulars: includedObjectNameSingulars ?? [],
      excludedObjectNameSingulars: excludedObjectNameSingulars ?? [],
    });

    const allRecordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[] =
      [];

    const filteredObjectMetadataItemsChunks = chunk(
      filteredObjectMetadataItems,
      OBJECT_METADATA_ITEMS_CHUNK_SIZE,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    for (const objectMetadataItemChunk of filteredObjectMetadataItemsChunks) {
      const recordsWithObjectMetadataItems = await Promise.all(
        objectMetadataItemChunk.map(async (flatObjectMetadata) => {
          return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
            authContext,
            async () => {
              const repository =
                await this.globalWorkspaceOrmManager.getRepository<ObjectRecord>(
                  workspaceId,
                  flatObjectMetadata.nameSingular,
                  rolePermissionConfig,
                );

              return {
                objectMetadataItem: flatObjectMetadata,
                records: await this.buildSearchQueryAndGetRecords({
                  entityManager: repository,
                  flatObjectMetadata,
                  flatFieldMetadataMaps,
                  searchTerms: formatSearchTerms(searchInput, 'and'),
                  searchTermsOr: formatSearchTerms(searchInput, 'or'),
                  limit: limit as number,
                  filter: filter ?? ({} as ObjectRecordFilter),
                  after,
                }),
              };
            },
          );
        }),
      );

      allRecordsWithObjectMetadataItems.push(...recordsWithObjectMetadataItems);
    }

    return allRecordsWithObjectMetadataItems;
  }

  filterObjectMetadataItems({
    flatObjectMetadatas,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
  }: {
    flatObjectMetadatas: FlatObjectMetadata[];
    includedObjectNameSingulars: string[];
    excludedObjectNameSingulars: string[];
  }) {
    return flatObjectMetadatas.filter(
      ({ nameSingular, isSearchable, isActive }) => {
        if (!isSearchable) {
          return false;
        }
        if (!isActive) {
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
    flatObjectMetadata,
    flatFieldMetadataMaps,
    searchTerms,
    searchTermsOr,
    limit,
    filter,
    after,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    searchTerms: string;
    searchTermsOr: string;
    limit: number;
    filter: ObjectRecordFilterInput;
    after?: string;
  }) {
    const queryBuilder = entityManager.createQueryBuilder();

    const { flatObjectMetadataMaps } = entityManager.internalContext;

    const queryParser = new GraphqlQueryParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );

    queryParser.applyFilterToBuilder(
      queryBuilder,
      flatObjectMetadata.nameSingular,
      filter,
    );

    queryParser.applyDeletedAtToBuilder(queryBuilder, filter);

    const imageIdentifierField = this.getImageIdentifierColumn(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    const fieldsToSelect = [
      'id',
      ...this.getLabelIdentifierColumns(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      ),
      ...(imageIdentifierField ? [imageIdentifierField] : []),
    ].map((field) => `"${field}"`);

    const tsRankCDExpr = `ts_rank_cd("${SEARCH_VECTOR_FIELD.name}", to_tsquery('simple', public.unaccent_immutable(:searchTerms)))`;

    const tsRankExpr = `ts_rank("${SEARCH_VECTOR_FIELD.name}", to_tsquery('simple', public.unaccent_immutable(:searchTermsOr)))`;

    const cursorWhereCondition = this.computeCursorWhereCondition({
      after,
      objectMetadataNameSingular: flatObjectMetadata.nameSingular,
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
            `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', public.unaccent_immutable(:searchTerms))`,
            { searchTerms },
          ).orWhere(
            `"${SEARCH_VECTOR_FIELD.name}" @@ to_tsquery('simple', public.unaccent_immutable(:searchTermsOr))`,
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
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    if (!flatObjectMetadata.labelIdentifierFieldMetadataId) {
      throw new SearchException(
        'Label identifier field not found',
        SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND,
      );
    }

    const labelIdentifierField =
      flatFieldMetadataMaps.byId[
        flatObjectMetadata.labelIdentifierFieldMetadataId
      ];

    if (!isDefined(labelIdentifierField)) {
      throw new SearchException(
        'Label identifier field not found',
        SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND,
      );
    }

    if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
      return [
        `${labelIdentifierField.name}FirstName`,
        `${labelIdentifierField.name}LastName`,
      ];
    }

    return [labelIdentifierField.name];
  }

  getLabelIdentifierValue(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): string {
    const labelIdentifierFields = this.getLabelIdentifierColumns(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    return labelIdentifierFields.map((field) => record[field]).join(' ');
  }

  getImageIdentifierColumn(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    if (flatObjectMetadata.nameSingular === 'company') {
      return 'domainNamePrimaryLinkUrl';
    }

    if (!flatObjectMetadata.imageIdentifierFieldMetadataId) {
      return null;
    }

    const imageIdentifierField =
      flatFieldMetadataMaps.byId[
        flatObjectMetadata.imageIdentifierFieldMetadataId
      ];

    if (!isDefined(imageIdentifierField)) {
      return null;
    }

    return imageIdentifierField.name;
  }

  private getImageUrlWithToken(avatarUrl: string, workspaceId: string): string {
    return this.fileService.signFileUrl({
      url: avatarUrl,
      workspaceId,
    });
  }

  getImageIdentifierValue(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
  ): string {
    const imageIdentifierField = this.getImageIdentifierColumn(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (flatObjectMetadata.nameSingular === 'company') {
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
    flatFieldMetadataMaps,
    workspaceId,
    limit,
    after,
  }: {
    recordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
            label: this.getLabelIdentifierValue(
              record,
              objectMetadataItem,
              flatFieldMetadataMaps,
            ),
            imageUrl: this.getImageIdentifierValue(
              record,
              objectMetadataItem,
              flatFieldMetadataMaps,
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
