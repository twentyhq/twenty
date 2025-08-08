import { Injectable } from '@nestjs/common';

import { type Request } from 'express';

import { type QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class CreateVariablesFactory {
  create(request: Request): QueryVariables {
    return {
      data: request.body,
    };
  }
}
