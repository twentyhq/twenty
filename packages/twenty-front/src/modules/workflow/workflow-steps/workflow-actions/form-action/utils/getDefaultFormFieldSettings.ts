import { t } from '@lingui/core/macro';
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
        label: t`Text`,
        placeholder: t`Enter your text`,
      };
    case FieldMetadataType.NUMBER:
      return {
        id: v4(),
        name: 'number',
        label: t`Number`,
        placeholder: '1000',
      };
    case FieldMetadataType.DATE:
      return {
        id: v4(),
        name: 'date',
        label: t`Date`,
        placeholder: 'mm/dd/yyyy',
      };
    case 'RECORD':
      return {
        id: v4(),
        name: 'record',
        label: t`Record`,
        placeholder: t`Select a Company`,
        settings: {
          objectName: CoreObjectNameSingular.Company,
        },
      };
    case FieldMetadataType.SELECT:
      return {
        id: v4(),
        name: 'select',
        label: t`Select`,
        placeholder: t`Choose a value`,
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    case FieldMetadataType.MULTI_SELECT:
      return {
        id: v4(),
        name: 'multiSelect',
        label: t`Multi-Select`,
        placeholder: t`Choose values`,
        settings: {
          selectType: 'EXISTING_FIELD',
          selectedFieldId: undefined,
        },
      };
    default:
      assertUnreachable(type);
  }
};
