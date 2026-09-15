import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  EventLogEmitterException,
  EventLogEmitterExceptionCode,
} from 'src/engine/core-modules/event-logs/emit/event-log-emitter.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EventLogEmitterException)
export class EventLogEmitterExceptionFilter implements ExceptionFilter {
  catch(exception: EventLogEmitterException) {
    switch (exception.code) {
      case EventLogEmitterExceptionCode.INVALID_TYPE:
      case EventLogEmitterExceptionCode.INVALID_INPUT:
        throw new UserInputError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
