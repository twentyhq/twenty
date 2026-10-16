import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type IconComponent,
  IllustrationIconCalendarEvent,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
} from 'twenty-ui/icon';

type FormSelectFieldTypeOption = {
  label: MessageDescriptor;
  value: WorkflowFormFieldType;
  Icon: IconComponent;
};

export const FORM_SELECT_FIELD_TYPE_OPTIONS: FormSelectFieldTypeOption[] = [
  {
    label: msg`Text`,
    value: FieldMetadataType.TEXT,
    Icon: IllustrationIconText,
  },
  {
    label: msg`Number`,
    value: FieldMetadataType.NUMBER,
    Icon: IllustrationIconNumbers,
  },
  {
    label: msg`Date`,
    value: FieldMetadataType.DATE,
    Icon: IllustrationIconCalendarEvent,
  },
  {
    label: msg`Record`,
    value: 'RECORD',
    Icon: IllustrationIconOneToMany,
  },
  {
    label: msg`Select`,
    value: FieldMetadataType.SELECT,
    Icon: IllustrationIconTag,
  },
  {
    label: msg`Multi-Select`,
    value: FieldMetadataType.MULTI_SELECT,
    Icon: IllustrationIconTags,
  },
];
