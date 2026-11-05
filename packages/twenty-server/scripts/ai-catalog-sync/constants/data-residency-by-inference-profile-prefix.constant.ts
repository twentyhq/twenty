import { type DataResidency } from '../../../../twenty-shared/src/ai/constants/data-residency.const';

export const DATA_RESIDENCY_BY_INFERENCE_PROFILE_PREFIX: Record<
  string,
  DataResidency
> = {
  eu: 'eu',
  us: 'us',
  global: 'global',
  apac: 'ap',
  jp: 'jp',
  au: 'au',
  ca: 'ca',
};
