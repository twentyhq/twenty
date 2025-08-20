import { Injectable } from '@nestjs/common';

import { type Request } from 'express';

import { addDefaultConjunctionIfMissing } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/add-default-conjunction.utils';
import { checkFilterQuery } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/check-filter-query.utils';
import { parseFilter } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';
import { type FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class FilterInputFactory {
  create(
    request: Request,
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
  ): Record<string, FieldValue> {
    let filterQuery = request.query.filter;

    if (typeof filterQuery !== 'string') {
      return {};
    }

    checkFilterQuery(filterQuery);

    filterQuery = addDefaultConjunctionIfMissing(filterQuery);

    return parseFilter(filterQuery, objectMetadata.objectMetadataMapItem);
  }
}
