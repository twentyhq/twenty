import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class FindDuplicatesVariablesFactory {
  create(request: Request): QueryVariables {
    return request.body;
  }
}
