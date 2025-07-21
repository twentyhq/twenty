import { KeyWrappingStrategy } from './enums/key-wrapping-strategies.enum';

export const KEY_WRAPPING_STRATEGY = Symbol('KEY_WRAPPING_STRATEGY');

export const DEFAULT_KEY_WRAPPING_STRATEGY =
  KeyWrappingStrategy.AES_256_KEY_WRAP;
