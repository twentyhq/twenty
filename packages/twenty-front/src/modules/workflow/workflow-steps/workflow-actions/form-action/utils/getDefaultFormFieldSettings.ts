import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { FieldMetadataType } from 'twenty-shared/types';
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
    default:
      assertUnreachable(type);
  }
};
