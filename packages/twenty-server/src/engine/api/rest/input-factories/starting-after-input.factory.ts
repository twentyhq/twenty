import { Injectable } from '@nestjs/common';

import { RequestContext } from 'src/engine/api/rest/types/RequestContext';

@Injectable()
export class StartingAfterInputFactory {
  create(request: RequestContext): string | undefined {
    const cursorQuery = request.query?.starting_after;

    if (typeof cursorQuery !== 'string') {
      return undefined;
    }

    return cursorQuery;
  }
}
