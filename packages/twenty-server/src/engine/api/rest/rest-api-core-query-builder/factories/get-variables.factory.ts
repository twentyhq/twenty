import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { LimitInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/order-by-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/filter-input.factory';
import { QueryVariables } from 'src/engine/api/rest/types/query-variables.type';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/ending-before-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/starting-after-input.factory';

@Injectable()
export class GetVariablesFactory {
  constructor(
    private readonly startingAfterInputFactory: StartingAfterInputFactory,
    private readonly endingBeforeInputFactory: EndingBeforeInputFactory,
    private readonly limitInputFactory: LimitInputFactory,
    private readonly orderByInputFactory: OrderByInputFactory,
    private readonly filterInputFactory: FilterInputFactory,
  ) {}

  create(
    id: string | undefined,
    request: Request,
    objectMetadata,
  ): QueryVariables {
    if (id) {
      return { filter: { id: { eq: id } } };
    }

    return {
      filter: this.filterInputFactory.create(request, objectMetadata),
      orderBy: this.orderByInputFactory.create(request, objectMetadata),
      limit: this.limitInputFactory.create(request),
      startingAfter: this.startingAfterInputFactory.create(request),
      endingBefore: this.endingBeforeInputFactory.create(request),
    };
  }
}
