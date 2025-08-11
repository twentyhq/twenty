import { Injectable } from '@nestjs/common';

import { type Request } from 'express';

import { type QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class FindDuplicatesVariablesFactory {
  create(request: Request): QueryVariables {
    return request.body;
  }
}
