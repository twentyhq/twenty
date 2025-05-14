import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import isEmpty from 'lodash.isempty';
import { In } from 'typeorm';

import {
  FormatResult,
  RestApiBaseHandler,
} from 'src/engine/api/rest/core/interfaces/rest-api-base.handler';
import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  formatResult,
  getCompositeFieldMetadataMap,
} from 'src/engine/twenty-orm/utils/format-result.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { settings } from 'src/engine/constants/settings';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';

@Injectable()
export class RestApiFindDuplicatesHandler extends RestApiBaseHandler {
  async handle(request: Request) {
    this.validate(request);

    const {
      objectMetadataNameSingular,
      repository,
      objectMetadata,
      objectMetadataItemWithFieldsMaps,
    } = await this.getRepositoryAndMetadataOrFail(request);

    const existingRecordsQueryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldsMaps.nameSingular,
    );

    let objectRecords: Partial<ObjectRecord>[] = [];

    if (request.body.ids) {
      const nonFormattedObjectRecords = (await existingRecordsQueryBuilder
        .where({ id: In(request.body.ids) })
        .getMany()) as ObjectRecord[];

      objectRecords = formatResult(
        nonFormattedObjectRecords,
        objectMetadataItemWithFieldsMaps,
        objectMetadata.objectMetadataMaps,
      );
    } else if (request.body.data && !isEmpty(request.body.data)) {
      objectRecords = request.body.data;
    }

    const duplicateConditions = objectRecords.map((record) =>
      this.buildDuplicateConditions(
        objectMetadataItemWithFieldsMaps,
        [record],
        record.id,
      ),
    );

    const result: { data: FormatResult[] } = {
      data: [],
    };

    for (const duplicateCondition of duplicateConditions) {
      const {
        records,
        isForwardPagination,
        hasMoreRecords,
        totalCount,
        startCursor,
        endCursor,
      } = await this.findRecords({
        request,
        repository,
        objectMetadata,
        objectMetadataNameSingular,
        objectMetadataItemWithFieldsMaps,
        extraFilters: duplicateCondition,
      });

      const paginatedResult = this.formatPaginatedDuplicatesResult({
        finalRecords: records,
        objectMetadataNameSingular,
        isForwardPagination,
        hasMoreRecords,
        totalCount,
        startCursor,
        endCursor,
      });

      result.data.push(paginatedResult);
    }

    return result;
  }

  private validate(request: Request) {
    const { data, ids } = request.body;

    if (!data && !ids) {
      throw new BadRequestException(
        'You have to provide either "data" or "ids" argument',
      );
    }

    if (data && ids) {
      throw new BadRequestException(
        'You cannot provide both "data" and "ids" arguments',
      );
    }

    if (!ids && isEmpty(data)) {
      throw new BadRequestException(
        'The "data" condition can not be empty when "ids" input not provided',
      );
    }
  }

  buildDuplicateConditions(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    records?: Partial<ObjectRecord>[] | undefined,
    filteringByExistingRecordId?: string,
  ): Partial<ObjectRecordFilter> {
    if (!records || records.length === 0) {
      return {};
    }

    const criteriaCollection =
      objectMetadataItemWithFieldMaps.duplicateCriteria || [];

    const formattedRecords = formatData(
      records,
      objectMetadataItemWithFieldMaps,
    );

    const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
      objectMetadataItemWithFieldMaps,
    );

    const conditions = formattedRecords.flatMap((record) => {
      const criteriaWithMatchingArgs = criteriaCollection.filter((criteria) =>
        criteria.every((columnName) => {
          const value = record[columnName] as string | undefined;

          return (
            value && value.length >= settings.minLengthOfStringForDuplicateCheck
          );
        }),
      );

      return criteriaWithMatchingArgs.map((criteria) => {
        const condition = {};

        criteria.forEach((columnName) => {
          const compositeFieldMetadata =
            compositeFieldMetadataMap.get(columnName);

          if (compositeFieldMetadata) {
            condition[compositeFieldMetadata.parentField] = {
              ...condition[compositeFieldMetadata.parentField],
              [compositeFieldMetadata.name]: { eq: record[columnName] },
            };
          } else {
            condition[columnName] = { eq: record[columnName] };
          }
        });

        return condition;
      });
    });

    const filter: Partial<ObjectRecordFilter> = {};

    if (conditions && !isEmpty(conditions)) {
      filter.or = conditions;

      if (filteringByExistingRecordId) {
        filter.id = { neq: filteringByExistingRecordId };
      }
    }

    return filter;
  }
}
