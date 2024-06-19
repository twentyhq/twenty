import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';

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

    const limit = this.limitInputFactory.create(request);
    const endingBefore = this.endingBeforeInputFactory.create(request);
    const startingAfter = this.startingAfterInputFactory.create(request);

    return {
      filter: this.filterInputFactory.create(request, objectMetadata),
      orderBy: this.orderByInputFactory.create(request, objectMetadata),
      first: !endingBefore ? limit : undefined,
      last: endingBefore ? limit : undefined,
      startingAfter,
      endingBefore,
    };
  }
}
