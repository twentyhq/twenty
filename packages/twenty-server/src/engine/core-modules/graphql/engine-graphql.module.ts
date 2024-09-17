import { Module } from '@nestjs/common';

import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';

@Module({
  imports: [ExceptionHandlerModule],
  exports: [useGraphQLErrorHandlerHook],
  providers: [],
})
export class EngineGraphQLModule {}
