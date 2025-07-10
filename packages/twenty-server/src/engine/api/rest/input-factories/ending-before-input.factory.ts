import { Injectable } from '@nestjs/common';

import { RequestContext } from 'src/engine/api/rest/types/RequestContext';

@Injectable()
export class EndingBeforeInputFactory {
  create(request: RequestContext): string | undefined {
    const cursorQuery = request.query?.ending_before;

    if (typeof cursorQuery !== 'string') {
      return undefined;
    }

    return cursorQuery;
  }
}
