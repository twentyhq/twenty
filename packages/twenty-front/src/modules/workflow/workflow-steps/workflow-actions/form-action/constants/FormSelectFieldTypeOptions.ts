import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  IllustrationIconCalendarEvent,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconTag,
  IllustrationIconText,
} from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export const FORM_SELECT_FIELD_TYPE_OPTIONS: SelectOption<WorkflowFormFieldType>[] =
  [
    {
      label: getDefaultFormFieldSettings(FieldMetadataType.TEXT).label,
      value: FieldMetadataType.TEXT,
      Icon: IllustrationIconText,
    },
    {
      label: getDefaultFormFieldSettings(FieldMetadataType.NUMBER).label,
      value: FieldMetadataType.NUMBER,
      Icon: IllustrationIconNumbers,
    },
    {
      label: getDefaultFormFieldSettings(FieldMetadataType.DATE).label,
      value: FieldMetadataType.DATE,
      Icon: IllustrationIconCalendarEvent,
    },
    {
      label: getDefaultFormFieldSettings('RECORD').label,
      value: 'RECORD',
      Icon: IllustrationIconOneToMany,
    },
    {
      label: 'Select',
      value: FieldMetadataType.SELECT,
      Icon: IllustrationIconTag,
    },
  ];
