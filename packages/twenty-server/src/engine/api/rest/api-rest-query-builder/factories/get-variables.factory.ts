import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { LastCursorInputFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/last-cursor-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/order-by-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/filter-input.factory';
import { ApiRestQueryVariables } from 'src/engine/api/rest/types/api-rest-query-variables.type';

@Injectable()
export class GetVariablesFactory {
  constructor(
    private readonly lastCursorInputFactory: LastCursorInputFactory,
    private readonly limitInputFactory: LimitInputFactory,
    private readonly orderByInputFactory: OrderByInputFactory,
    private readonly filterInputFactory: FilterInputFactory,
  ) {}

  create(
    id: string | undefined,
    request: Request,
    objectMetadata,
  ): ApiRestQueryVariables {
    if (id) {
      return { filter: { id: { eq: id } } };
    }

    return {
      filter: this.filterInputFactory.create(request, objectMetadata),
      orderBy: this.orderByInputFactory.create(request, objectMetadata),
      limit: this.limitInputFactory.create(request),
      lastCursor: this.lastCursorInputFactory.create(request),
    };
  }
}
