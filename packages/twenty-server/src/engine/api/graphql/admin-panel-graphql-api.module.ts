import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';

import { adminPanelModuleFactory } from 'src/engine/api/graphql/admin-panel.module-factory';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: adminPanelModuleFactory,
      imports: [
        GraphQLConfigModule,
        DataloaderModule,
        MetricsModule,
        I18nModule,
      ],
      inject: [
        TwentyConfigService,
        ExceptionHandlerService,
        DataloaderService,
        MetricsService,
        I18nService,
      ],
    }),
    AdminPanelModule,
  ],
})
export class AdminPanelGraphQLApiModule {}
