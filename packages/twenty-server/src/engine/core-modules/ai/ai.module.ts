import { DynamicModule, Global, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AiDriver,
  AiModuleAsyncOptions,
} from 'src/engine/core-modules/ai/interfaces/ai.interface';

import { AI_DRIVER } from 'src/engine/core-modules/ai/ai.constants';
import { AiService } from 'src/engine/core-modules/ai/ai.service';
import { AiController } from 'src/engine/core-modules/ai/controllers/ai.controller';
import { OpenAIDriver } from 'src/engine/core-modules/ai/drivers/openai.driver';
import { AIModel } from 'src/engine/core-modules/ai/entities/ai-model.entity';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AIModelService } from 'src/engine/core-modules/ai/services/ai-model.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

@Global()
export class AiModule {
  static forRoot(options: AiModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      provide: AI_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        switch (config?.type) {
          case AiDriver.OPENAI: {
            return new OpenAIDriver();
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: AiModule,
      imports: [FeatureFlagModule, TypeOrmModule.forFeature([AIModel], 'core')],
      controllers: [AiController],
      providers: [AiService, AIModelService, AIBillingService, provider],
      exports: [AiService, AIModelService, AIBillingService],
    };
  }
}
