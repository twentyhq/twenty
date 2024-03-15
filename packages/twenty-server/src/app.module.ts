import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { existsSync } from 'fs';
import { join } from 'path';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/engine-graphql-config/graphql-config.service';
import { ApiRestModule } from 'src/engine/api/rest/api-rest.module';
import { ModulesModule } from 'src/modules/modules.module';

import { EngineModulesModule } from './engine/modules/engine-modules.module';
import { IntegrationsModule } from './engine/integrations/integrations.module';
import { CoreGraphqlApiModule } from './engine/api/graphql/core-graphql-api.module';
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
      imports: [EngineModulesModule, GraphQLConfigModule],
      useClass: GraphQLConfigService,
    }),
    IntegrationsModule,
    EngineModulesModule,
    ModulesModule,
    ApiRestModule,
    CoreGraphqlApiModule,
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
