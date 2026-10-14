import { type ComponentType } from 'react';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

export type CoreRecordReferenceField = {
  objectNameSingular: string;
  fieldName: string;
  coreRecordIdFieldName: string;
  CoreRecordDisplay: ComponentType<
    { coreRecordId: string } & FieldDisplayTooltipProps
  >;
};
