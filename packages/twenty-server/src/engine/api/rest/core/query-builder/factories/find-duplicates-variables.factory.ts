import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class FindDuplicatesVariablesFactory {
  create(request: Request): QueryVariables {
    const data = request.body.data || [];
    const ids = request.body.ids || data.map((item) => item.id).filter(Boolean);

    return {
      ids,
    };
  }
}
