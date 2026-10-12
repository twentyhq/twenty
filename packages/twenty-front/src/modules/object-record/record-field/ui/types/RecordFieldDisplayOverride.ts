import { type ComponentType } from 'react';
import { type RecordGqlFields } from 'twenty-shared/types';

import { type FeatureFlagKey } from '~/generated-metadata/graphql';

export type RecordFieldDisplayOverride = {
  objectNameSingular: string;
  fieldName: string;
  featureFlagKey: FeatureFlagKey;
  recordGqlFields: RecordGqlFields;
  DisplayComponent: ComponentType;
};
