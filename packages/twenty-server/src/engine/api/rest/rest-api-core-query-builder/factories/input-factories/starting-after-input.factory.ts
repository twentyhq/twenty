import { Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class StartingAfterInputFactory {
  create(request: Request): string | undefined {
    const cursorQuery = request.query.starting_after;

    if (typeof cursorQuery !== 'string') {
      return undefined;
    }

    return cursorQuery;
  }
}
