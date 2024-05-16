import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { QueryVariables } from 'src/engine/api/rest/types/query-variables.type';

@Injectable()
export class CreateVariablesFactory {
  create(request: Request): QueryVariables {
    const data = Array.isArray(request.body)
      ? request.body.map((recordData) => {
          return { position: 'first', ...recordData };
        })
      : { position: 'first', ...request.body };

    return {
      data,
    };
  }
}
