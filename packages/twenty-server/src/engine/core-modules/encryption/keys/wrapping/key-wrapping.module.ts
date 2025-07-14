import { DynamicModule, Global, Provider } from '@nestjs/common';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { KEY_WRAPPING_STRATEGY } from './key-wrapping.constants';
import { KeyWrappingService } from './key-wrapping.service';

import { IKeyWrappingStrategy } from './strategies/interface/key-wrapping-strategy.interface';
import { KeyWrappingStrategy } from './enums/key-wrapping-strategies.enum';
import { Aes256KeyWrapStrategy } from './strategies/aes-key-wrap.strategy';
import { KeyWrappingModuleAsyncOptions } from './interface/key-wrapping.interface';

@Global()
export class KeyWrappingModule {
  static forRoot(options: KeyWrappingModuleAsyncOptions): DynamicModule {
    const strategyProvider: Provider = {
      provide: KEY_WRAPPING_STRATEGY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);
        let strategy: IKeyWrappingStrategy;

        switch (config.type) {
          case KeyWrappingStrategy.AES_256_KEY_WRAP:
            strategy = new Aes256KeyWrapStrategy();
            break;
          default:
            throw new Error(`Invalid KDF algorithm specified in factory.`);
        }

        return strategy;
      },
      inject: [TwentyConfigService, ...(options.inject || [])],
    };

    return {
      module: KeyWrappingModule,
      imports: [JwtModule],
      providers: [KeyWrappingService, strategyProvider],
      exports: [KeyWrappingService],
    };
  }
}
