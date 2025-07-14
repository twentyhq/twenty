import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { KeyWrappingStrategy } from './enums/key-wrapping-strategies.enum';

export const keyWrappingConfigFactory = (
  twentyConfigService: TwentyConfigService,
) => {
  const algorithm = twentyConfigService.get('KEY_WRAPPING_STRATEGY');

  switch (algorithm) {
    case KeyWrappingStrategy.AES_256_KEY_WRAP:
      return { type: KeyWrappingStrategy.AES_256_KEY_WRAP };
    default:
      throw new Error(`Unsupported key derivation algorithm: ${algorithm}`);
  }
};
