import { type ComponentType } from 'react';

export type CoreRecordReferenceField = {
  objectNameSingular: string;
  fieldName: string;
  coreRecordIdFieldName: string;
  CoreRecordDisplay: ComponentType<{ coreRecordId: string }>;
};
