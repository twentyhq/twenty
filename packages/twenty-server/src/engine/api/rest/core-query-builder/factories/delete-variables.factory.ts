import { Injectable } from '@nestjs/common';

import { ApiRestQueryVariables } from 'src/engine/api/rest/types/query-variables.type';

@Injectable()
export class DeleteVariablesFactory {
  create(id: string): ApiRestQueryVariables {
    return {
      id: id,
    };
  }
}
