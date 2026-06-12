import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { assertUnreachable } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const getDefaultFormFieldSettings = (type: WorkflowFormFieldType) => {
  switch (type) {
    case FieldMetadataType.TEXT:
      return {
        id: v4(),
        name: 'text',
        label: 'Text',
        placeholder: 'Enter your text',
      };
    case FieldMetadataType.NUMBER:
      return {
        id: v4(),
        name: 'number',
        label: 'Number',
        placeholder: '1000',
      };
    case FieldMetadataType.DATE:
      return {
        id: v4(),
        name: 'date',
        label: 'Date',
        placeholder: 'mm/dd/yyyy',
      };
    case 'RECORD':
      return {
        id: v4(),
        name: 'record',
        label: 'Record',
        placeholder: `Select a Company`,
        settings: {
          objectName: CoreObjectNameSingular.Company,
        },
      };
    case FieldMetadataType.SELECT:
      return {
        id: v4(),
        name: 'select',
        label: 'Select',
        placeholder: 'Choose a value',
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    case FieldMetadataType.MULTI_SELECT:
      return {
        id: v4(),
        name: 'multiSelect',
        label: 'Multi-Select',
        placeholder: 'Choose values',
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    default:
      assertUnreachable(type);
  }
};
