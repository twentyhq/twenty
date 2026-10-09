import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ServerRouteBearerTokenVerifierService } from 'src/engine/core-modules/server-route-trigger/server-route-bearer-token-verifier.service';
import { ServerRouteReachabilityService } from 'src/engine/core-modules/server-route-trigger/server-route-reachability.service';
import { ServerRouteTriggerController } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.controller';
import { ServerRouteTriggerGaugeService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger-gauge.service';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogicFunctionEntity,
      ApplicationRegistrationVariableEntity,
    ]),
    MetricsModule,
    SecretEncryptionModule,
    SecureHttpClientModule,
  ],
  controllers: [ServerRouteTriggerController],
  providers: [
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    ServerRouteTriggerService,
    ServerRouteBearerTokenVerifierService,
    ServerRouteReachabilityService,
    ServerRouteTriggerGaugeService,
  ],
})
export class ServerRouteTriggerModule {}
