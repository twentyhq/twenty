import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { existsSync } from 'fs';
import { join } from 'path';

import { EngineModule } from 'src/engine/engine.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { BusinessModule } from 'src/modules/business.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EngineModule,
    IntegrationsModule,
    BusinessModule,
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
