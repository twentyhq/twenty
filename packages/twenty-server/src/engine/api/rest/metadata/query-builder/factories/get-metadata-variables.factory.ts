import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { MetadataQueryVariables } from 'src/engine/api/rest/metadata/types/metadata-query-variables.type';

@Injectable()
export class GetMetadataVariablesFactory {
  constructor(
    private readonly startingAfterInputFactory: StartingAfterInputFactory,
    private readonly endingBeforeInputFactory: EndingBeforeInputFactory,
    private readonly limitInputFactory: LimitInputFactory,
  ) {}

  create(id: string | undefined, request: Request): MetadataQueryVariables {
    if (id) {
      return { id };
    }

    return {
      paging: {
        first: this.limitInputFactory.create(request, 1000),
        after: this.startingAfterInputFactory.create(request),
        before: this.endingBeforeInputFactory.create(request),
      },
    };
  }
}
