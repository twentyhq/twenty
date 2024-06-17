import { Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class EndingBeforeInputFactory {
  create(request: Request): string | undefined {
    const cursorQuery = request.query.ending_before;

    if (typeof cursorQuery !== 'string') {
      return undefined;
    }

    return cursorQuery;
  }
}
