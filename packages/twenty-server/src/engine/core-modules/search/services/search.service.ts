import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  FileFolder,
  ObjectRecord,
} from 'twenty-shared/types';
import { getLogoUrlFromDomainName, isDefined } from 'twenty-shared/utils';
import { Brackets, type ObjectLiteral } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { isQueryCanceledError } from 'src/engine/api/graphql/workspace-query-runner/utils/is-query-canceled-error.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
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
import { escapeForIlike } from 'src/engine/core-modules/search/utils/escape-for-ilike';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';

type LastRanks = { tsRankCD: number; tsRank: number };

export type SearchCursor = {
  lastRanks: LastRanks;
  lastRecordIdsPerObject: Record<string, string | undefined>;
};

const OBJECT_METADATA_ITEMS_CHUNK_SIZE = 5;

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileUrlService: FileUrlService,
    private readonly twentyConfigService: TwentyConfigService,
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
  }: {
    flatObjectMetadatas: FlatObjectMetadata[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
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

    for (const objectMetadataItemChunk of filteredObjectMetadataItemsChunks) {
      const recordsWithObjectMetadataItems = await Promise.all(
        objectMetadataItemChunk.map(async (flatObjectMetadata) => {
          return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
            async () => {
              const context = getWorkspaceContext();
              const rolePermissionConfig =
                resolveRolePermissionConfig({
                  authContext: context.authContext,
                  userWorkspaceRoleMap: context.userWorkspaceRoleMap,
                  apiKeyRoleMap: context.apiKeyRoleMap,
                }) ?? undefined;

              const repository =
                await this.globalWorkspaceOrmManager.getRepository<ObjectRecord>(
                  workspaceId,
                  flatObjectMetadata.nameSingular,
                  rolePermissionConfig,
                );

              return {
                objectMetadataItem: flatObjectMetadata,
                records: await this.buildSearchQueryAndGetRecordsWithFallback({
                  entityManager: repository,
                  flatObjectMetadata,
                  flatFieldMetadataMaps,
                  searchInput,
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
    const hasExplicitInclusion = includedObjectNameSingulars.length > 0;

    return flatObjectMetadatas.filter(
      ({ nameSingular, isSearchable, isActive }) => {
        if (!isActive) {
          return false;
        }

        if (hasExplicitInclusion) {
          if (
            OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS.includes(
              nameSingular as (typeof OBJECTS_WITH_CHANNEL_VISIBILITY_CONSTRAINTS)[number],
            )
          ) {
            return false;
          }

          return (
            includedObjectNameSingulars.includes(nameSingular) &&
            !excludedObjectNameSingulars.includes(nameSingular)
          );
        }

        if (!isSearchable) {
          return false;
        }

        if (excludedObjectNameSingulars.includes(nameSingular)) {
          return false;
        }

        return true;
      },
    );
  }

  // Runs a fast tsvector query first (uses GIN index). If tsvector returns zero
  // results for an object type on the first page, falls back to ILIKE on the
  // searchVector text to catch cases where tokenization fails (e.g. CJK text).
  // Skipped when tsvector finds any results (partial results mean the data just
  // has fewer matches, not a tokenization issue) and on paginated requests.
  async buildSearchQueryAndGetRecordsWithFallback<
    Entity extends ObjectLiteral,
  >({
    entityManager,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    searchInput,
    searchTerms,
    searchTermsOr,
    limit,
    filter,
    after,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    searchInput: string;
    searchTerms: string;
    searchTermsOr: string;
    limit: number;
    filter: ObjectRecordFilterInput;
    after?: string;
  }) {
    const tsvectorResults = await this.buildSearchQueryAndGetRecords({
      entityManager,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      searchTerms,
      searchTermsOr,
      limit,
      filter,
      after,
    });

    if (
      tsvectorResults.length > 0 ||
      !isNonEmptyString(searchInput.trim()) ||
      isDefined(after)
    ) {
      return tsvectorResults;
    }

    const fallbackResults = await this.buildIlikeFallbackQuery({
      entityManager,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      searchInput,
      limit: limit + 1,
      filter,
    });

    return [...tsvectorResults, ...fallbackResults];
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

  private async buildIlikeFallbackQuery<Entity extends ObjectLiteral>({
    entityManager,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    searchInput,
    limit,
    filter,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    searchInput: string;
    limit: number;
    filter: ObjectRecordFilterInput;
  }) {
    const timeoutMs = this.twentyConfigService.get(
      'SEARCH_ILIKE_FALLBACK_TIMEOUT_MS',
    );

    // Must not run inside a caller transaction: SET LOCAL is transaction-scoped
    // and would leak into the outer transaction.
    try {
      return await entityManager.manager.transaction(
        async (transactionManager) => {
          const { queryRunner } = transactionManager;

          if (!isDefined(queryRunner)) {
            throw new Error(
              'Expected queryRunner to be defined within transaction',
            );
          }

          await queryRunner.query(
            `SELECT set_config('statement_timeout', $1, true)`,
            [String(timeoutMs)],
          );

          const queryBuilder = entityManager.createQueryBuilder(
            undefined,
            queryRunner,
          );

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

          queryBuilder.select(fieldsToSelect);

          const searchWords = searchInput
            .trim()
            .split(/\s+/)
            .filter(isNonEmptyString);

          searchWords.forEach((word, index) => {
            const paramName = `ilikeFallback${index}`;

            queryBuilder.andWhere(
              `public.unaccent_immutable("${SEARCH_VECTOR_FIELD.name}"::text) ILIKE public.unaccent_immutable(:${paramName})`,
              { [paramName]: `%${escapeForIlike(word)}%` },
            );
          });

          const rawResults = await queryBuilder
            .orderBy('"id"', 'ASC')
            .take(limit)
            .getRawMany();

          return rawResults.map((record) => ({
            ...record,
            tsRankCD: 0,
            tsRank: 0,
          }));
        },
      );
    } catch (error) {
      if (isQueryCanceledError(error)) {
        this.logger.warn(
          `Search ILIKE fallback exceeded ${timeoutMs}ms timeout`,
          {
            workspaceId: entityManager.internalContext.workspaceId,
            objectNameSingular: flatObjectMetadata.nameSingular,
            searchInputLength: searchInput.length,
          },
        );

        return [];
      }

      throw error;
    }
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

    const labelIdentifierField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

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

    //TODO: Temporary solution before imageIdentifier refactor
    if (flatObjectMetadata.nameSingular === 'person') {
      return 'avatarFile';
    }

    if (flatObjectMetadata.nameSingular === 'workspaceMember') {
      return 'avatarUrl';
    }

    if (!flatObjectMetadata.imageIdentifierFieldMetadataId) {
      return null;
    }

    const imageIdentifierField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatObjectMetadata.imageIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(imageIdentifierField)) {
      return null;
    }

    return imageIdentifierField.name;
  }

  private async getImageUrlWithToken(
    avatarFileId: string,
    fileFolder: FileFolder,
    workspaceId: string,
  ): Promise<string> {
    return this.fileUrlService.signFileByIdUrl({
      fileId: avatarFileId,
      workspaceId,
      fileFolder,
    });
  }

  async getImageIdentifierValue(
    record: ObjectRecord,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId: string,
  ): Promise<string> {
    const imageIdentifierField = this.getImageIdentifierColumn(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (
      flatObjectMetadata.nameSingular === 'company' &&
      this.twentyConfigService.get('ALLOW_REQUESTS_TO_TWENTY_ICONS')
    ) {
      return getLogoUrlFromDomainName(record.domainNamePrimaryLinkUrl) || '';
    }

    //TODO: Temporary solution before imageIdentifier refactor
    if (flatObjectMetadata.nameSingular === 'person') {
      const avatarFileId = (record.avatarFile as FileOutput[])?.[0]?.fileId;
      if (!isDefined(avatarFileId)) {
        return '';
      }
      return this.getImageUrlWithToken(
        avatarFileId,
        FileFolder.FilesField,
        workspaceId,
      );
    }

    if (flatObjectMetadata.nameSingular === 'workspaceMember') {
      const avatarFileId = extractFileIdFromUrl(
        record.avatarUrl,
        FileFolder.CorePicture,
      );
      if (!isDefined(avatarFileId)) {
        return '';
      }
      return this.getImageUrlWithToken(
        avatarFileId,
        FileFolder.CorePicture,
        workspaceId,
      );
    }

    return imageIdentifierField &&
      isNonEmptyString(record[imageIdentifierField])
      ? this.getImageUrlWithToken(
          record[imageIdentifierField],
          FileFolder.FilesField,
          workspaceId,
        )
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

  async computeSearchObjectResults({
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
  }): Promise<SearchResultConnectionDTO> {
    const recordPromises = recordsWithObjectMetadataItems.flatMap(
      ({ objectMetadataItem, records }) => {
        return records.map(async (record) => {
          return {
            recordId: record.id,
            objectNameSingular: objectMetadataItem.nameSingular,
            objectLabelSingular:
              objectMetadataItem.standardOverrides?.labelSingular ??
              objectMetadataItem.labelSingular,
            label: this.getLabelIdentifierValue(
              record,
              objectMetadataItem,
              flatFieldMetadataMaps,
            ),
            imageUrl: await this.getImageIdentifierValue(
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
    const searchRecords = await Promise.all(recordPromises);

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
