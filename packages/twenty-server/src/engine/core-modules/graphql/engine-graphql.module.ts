import { Module } from '@nestjs/common';

import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';
import { useGraphQLErrorHandlerHook } from 'src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';

@Module({
  imports: [ExceptionHandlerModule],
  exports: [useGraphQLErrorHandlerHook, ResolverValidationPipe],
  providers: [ResolverValidationPipe],
})
export class EngineGraphQLModule {}
