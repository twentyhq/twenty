import { Injectable } from '@nestjs/common';

import { QueryVariables } from 'src/engine/api/rest/core/types/query-variables.type';

@Injectable()
export class DeleteVariablesFactory {
  create(id: string): QueryVariables {
    return {
      id: id,
    };
  }
}
