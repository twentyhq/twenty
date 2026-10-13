import { type ComponentType } from 'react';
import { type RecordGqlFields } from 'twenty-shared/types';

export type RecordFieldDisplayOverride = {
  objectNameSingular: string;
  fieldName: string;
  recordGqlFields: RecordGqlFields;
  DisplayComponent: ComponentType;
};
