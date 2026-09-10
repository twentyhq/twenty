import { Catch, type ExceptionFilter } from '@nestjs/common';

import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { throttlerToGraphqlApiExceptionHandler } from 'src/engine/core-modules/throttler/utils/throttler-to-graphql-api-exception-handler.util';

@Catch(ThrottlerException)
export class ThrottlerGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException) {
    return throttlerToGraphqlApiExceptionHandler(exception);
  }
}
