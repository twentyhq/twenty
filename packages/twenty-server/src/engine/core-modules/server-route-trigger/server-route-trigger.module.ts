import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ServerRouteAuthorizationHeaderService } from 'src/engine/core-modules/server-route-trigger/server-route-authorization-header.service';
import { ServerRouteReachabilityService } from 'src/engine/core-modules/server-route-trigger/server-route-reachability.service';
import { ServerRouteTriggerController } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.controller';
import { ServerRouteTriggerGaugeService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger-gauge.service';
import { ServerRouteTriggerService } from 'src/engine/core-modules/server-route-trigger/server-route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity]),
    MetricsModule,
    JwtModule,
  ],
  controllers: [ServerRouteTriggerController],
  providers: [
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    ServerRouteTriggerService,
    ServerRouteAuthorizationHeaderService,
    ServerRouteReachabilityService,
    ServerRouteTriggerGaugeService,
  ],
})
export class ServerRouteTriggerModule {}
