import { DynamicModule, Global, Provider } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { KEY_WRAPPING_STRATEGY } from './key-wrapping.constants';
import { KeyWrappingService } from './key-wrapping.service';

import { KeyWrappingStrategy } from './enums/key-wrapping-strategies.enum';
import { KeyWrappingModuleAsyncOptions } from './interface/key-wrapping.interface';
import { Aes256KeyWrapStrategy } from './strategies/aes-key-wrap.strategy';
import { KeyWrappingStrategyInterface } from './strategies/interface/key-wrapping-strategy.interface';

@Global()
export class KeyWrappingModule {
  static forRoot(options: KeyWrappingModuleAsyncOptions): DynamicModule {
    const strategyProvider: Provider = {
      provide: KEY_WRAPPING_STRATEGY,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);
        let strategy: KeyWrappingStrategyInterface;

        switch (config.type) {
          case KeyWrappingStrategy.AES_256_KEY_WRAP:
            strategy = new Aes256KeyWrapStrategy();
            break;
          default:
            throw new Error(`Invalid KDF algorithm specified in factory.`);
        }

        return strategy;
      },
    };

    return {
      module: KeyWrappingModule,
      imports: [JwtModule],
      providers: [KeyWrappingService, strategyProvider],
      exports: [KeyWrappingService],
    };
  }
}
