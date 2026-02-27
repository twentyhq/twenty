import {
  BACKEND_BATCH_REQUEST_MAX_COUNT,
  MUTATION_MAX_MERGE_RECORDS,
} from 'twenty-shared/constants';
import {
  ActionViewType,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';

type KnownConstantValue = string | number | Record<string, string | number>;

export const ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED: Record<
  string,
  KnownConstantValue
> = {
  BACKEND_BATCH_REQUEST_MAX_COUNT,
  MUTATION_MAX_MERGE_RECORDS,
  CoreObjectNameSingular: {
    ...CoreObjectNameSingular,
  },
  FeatureFlagKey: {
    ...FeatureFlagKey,
  },
  ActionViewType: {
    ...ActionViewType,
  },
};
