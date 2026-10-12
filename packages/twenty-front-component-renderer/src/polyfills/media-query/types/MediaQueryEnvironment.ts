import { type InputMediaFeatures } from '@/types/InputMediaFeatures';

export type MediaQueryEnvironment = InputMediaFeatures & {
  componentWidth: number;
  componentHeight: number;
  devicePixelRatio: number;
  colorScheme: 'light' | 'dark';
};
