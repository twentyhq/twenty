import { DEFAULT_KEY_WRAPPING_STRATEGY } from './key-wrapping.constants';

export const keyWrappingConfigFactory = () => {
  // Always use AES_256_KEY_WRAP as it's the only available strategy
  return { type: DEFAULT_KEY_WRAPPING_STRATEGY };
};
