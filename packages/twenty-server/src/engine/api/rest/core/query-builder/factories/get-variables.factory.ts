import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class GetVariablesFactory {
  constructor(
    private readonly orderByInputFactory: OrderByInputFactory,
    private readonly filterInputFactory: FilterInputFactory,
  ) {}

  create(
    id: string | undefined,
    request: AuthenticatedRequest,
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
  ): QueryVariables {
    if (isDefined(id)) {
      return { filter: { id: { eq: id } } };
    }

    const filter = this.filterInputFactory.create(request, objectMetadata);
    const limit = parseLimitRestRequest(request);
    const orderBy = this.orderByInputFactory.create(request, objectMetadata);
    const endingBefore = parseEndingBeforeRestRequest(request);
    const startingAfter = parseStartingAfterRestRequest(request);

    return {
      filter,
      orderBy,
      first: !endingBefore ? limit : undefined,
      last: endingBefore ? limit : undefined,
      startingAfter,
      endingBefore,
    };
  }
}
