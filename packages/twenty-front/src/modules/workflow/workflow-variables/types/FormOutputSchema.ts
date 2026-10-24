import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type FieldMetadataType } from 'twenty-shared/types';

type FormFieldLeaf = {
  isLeaf: true;
  type: FieldMetadataType;
  label: string;
  value: any;
  fieldMetadataId?: string;
};

type FormFieldNode = {
  isLeaf: false;
  label: string;
  value: RecordOutputSchemaV2;
};

export type FormOutputSchema = Record<string, FormFieldLeaf | FormFieldNode>;
