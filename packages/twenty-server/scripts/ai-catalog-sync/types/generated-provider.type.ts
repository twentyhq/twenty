import { type AiSdkPackage } from 'twenty-shared/ai';

import { type GeneratedModel } from './generated-model.type';

export type GeneratedProvider = {
  npm: AiSdkPackage;
  label: string;
  apiKey: string;
  models: GeneratedModel[];
};
