import { BadRequestException, Injectable } from '@nestjs/common';

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

    const limit = this.limitInputFactory.create(request, 1000);
    const before = this.endingBeforeInputFactory.create(request);
    const after = this.startingAfterInputFactory.create(request);

    if (before && after) {
      throw new BadRequestException(
        `Only one of 'endingBefore' and 'startingAfter' may be provided`,
      );
    }

    return {
      paging: {
        first: !before ? limit : undefined,
        last: before ? limit : undefined,
        after,
        before,
      },
    };
  }
}
