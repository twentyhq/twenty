import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

// Form fields save these English defaults from getDefaultFormFieldSettings, so they are translated when displayed, never when written
export const FORM_FIELD_DEFAULT_TEXTS: Array<{
  type: WorkflowFormFieldType;
  text: string;
  message: MessageDescriptor;
}> = [
  { type: FieldMetadataType.TEXT, text: 'Text', message: msg`Text` },
  {
    type: FieldMetadataType.TEXT,
    text: 'Enter your text',
    message: msg`Enter your text`,
  },
  { type: FieldMetadataType.NUMBER, text: 'Number', message: msg`Number` },
  { type: FieldMetadataType.DATE, text: 'Date', message: msg`Date` },
  { type: 'RECORD', text: 'Record', message: msg`Record` },
  {
    type: 'RECORD',
    text: 'Select a Company',
    message: msg`Select a Company`,
  },
  { type: FieldMetadataType.SELECT, text: 'Select', message: msg`Select` },
  {
    type: FieldMetadataType.SELECT,
    text: 'Choose a value',
    message: msg`Choose a value`,
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    text: 'Multi-Select',
    message: msg`Multi-Select`,
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    text: 'Choose values',
    message: msg`Choose values`,
  },
];
