import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { existsSync } from 'fs';
import { join } from 'path';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/engine-graphql-config/graphql-config.service';
import { ApiRestModule } from 'src/api/rest/api-rest.module';
import { BusinessModule } from 'src/business/modules/business.module';

import { FoundationModule } from './engine/modules/foundation.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WorkspaceModule } from './engine/graphql/workspace.module';
import { GraphQLConfigModule } from './engine-graphql-config/graphql-config.module';

@Module({
  imports: [
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [FoundationModule, GraphQLConfigModule],
      useClass: GraphQLConfigService,
    }),
    IntegrationsModule,
    FoundationModule,
    BusinessModule,
    ApiRestModule,
    WorkspaceModule,
    ...AppModule.getConditionalModules(),
  ],
})
export class AppModule {
  private static getConditionalModules(): DynamicModule[] {
    const modules: DynamicModule[] = [];
    const frontPath = join(__dirname, '..', 'front');

    if (existsSync(frontPath)) {
      modules.push(
        ServeStaticModule.forRoot({
          rootPath: frontPath,
        }),
      );
    }

    return modules;
  }
}
