import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class UpdateVariablesFactory {
  create(id: string, request: Request): QueryVariables {
    return {
      id,
      data: request.body,
    };
  }
}
