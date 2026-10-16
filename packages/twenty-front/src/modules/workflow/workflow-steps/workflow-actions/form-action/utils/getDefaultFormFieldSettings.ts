import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { assertUnreachable } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { v4 } from 'uuid';

export const getDefaultFormFieldSettings = (type: WorkflowFormFieldType) => {
  switch (type) {
    case FieldMetadataType.TEXT:
      return {
        id: v4(),
        name: 'text',
        label: doNotTranslate('Text'),
        placeholder: doNotTranslate('Enter your text'),
      };
    case FieldMetadataType.NUMBER:
      return {
        id: v4(),
        name: 'number',
        label: doNotTranslate('Number'),
        placeholder: '1000',
      };
    case FieldMetadataType.DATE:
      return {
        id: v4(),
        name: 'date',
        label: doNotTranslate('Date'),
        placeholder: doNotTranslate('mm/dd/yyyy'),
      };
    case 'RECORD':
      return {
        id: v4(),
        name: 'record',
        label: doNotTranslate('Record'),
        placeholder: doNotTranslate(`Select a Company`),
        settings: {
          objectName: CoreObjectNameSingular.Company,
        },
      };
    case FieldMetadataType.SELECT:
      return {
        id: v4(),
        name: 'select',
        label: doNotTranslate('Select'),
        placeholder: doNotTranslate('Choose a value'),
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    case FieldMetadataType.MULTI_SELECT:
      return {
        id: v4(),
        name: 'multiSelect',
        label: doNotTranslate('Multi-Select'),
        placeholder: doNotTranslate('Choose values'),
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    default:
      assertUnreachable(type);
  }
};
