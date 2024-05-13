import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { ApiRestQueryVariables } from 'src/engine/api/rest/types/api-rest-query-variables.type';

@Injectable()
export class CreateVariablesFactory {
  create(request: Request): ApiRestQueryVariables {
    return {
      data: request.body,
    };
  }
}
