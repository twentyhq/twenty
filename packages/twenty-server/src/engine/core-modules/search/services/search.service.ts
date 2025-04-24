import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import { Brackets, ObjectLiteral } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { RESULTS_LIMIT_BY_OBJECT_WITHOUT_SEARCH_TERMS } from 'src/engine/core-modules/search/constants/results-limit-by-object-without-search-terms';
import { STANDARD_OBJECTS_BY_PRIORITY_RANK } from 'src/engine/core-modules/search/constants/standard-objects-by-priority-rank';
import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';
import { SearchRecordDTO } from 'src/engine/core-modules/search/dtos/search-record-dto';
import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { RecordsWithObjectMetadataItem } from 'src/engine/core-modules/search/types/records-with-object-metadata-item';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class SearchService {
  constructor(private readonly fileService: FileService) {}

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
    featureFlagMap,
    searchTerms,
    searchTermsOr,
    limit,
    filter,
  }: {
    entityManager: WorkspaceRepository<Entity>;
    objectMetadataItem: ObjectMetadataItemWithFieldMaps;
    featureFlagMap: FeatureFlagMap;
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
      featureFlagMap,
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

    const searchQuery = searchTerms
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
          .take(limit)
      : queryBuilder
          .select(fieldsToSelect)
          .addSelect('0', 'tsRankCD')
          .addSelect('0', 'tsRank')
          .andWhere(
            new Brackets((qb) => {
              qb.where(`"${SEARCH_VECTOR_FIELD.name}" IS NOT NULL`);
            }),
          )
          .take(RESULTS_LIMIT_BY_OBJECT_WITHOUT_SEARCH_TERMS);

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

  computeSearchObjectResults(
    recordsWithObjectMetadataItems: RecordsWithObjectMetadataItem[],
    limit: number,
    workspaceId: string,
  ) {
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

    return this.sortSearchObjectResults(searchRecords).slice(0, limit);
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
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[b.objectNameSingular] || 0) -
        (STANDARD_OBJECTS_BY_PRIORITY_RANK[a.objectNameSingular] || 0)
      );
    });
  }
}
