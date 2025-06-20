import { FieldMetadataType } from 'twenty-shared/types';
import {
  IllustrationIconCalendarEvent,
  IllustrationIconNumbers,
  IllustrationIconText,
} from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

export type WorkflowOutputFieldType =
  | FieldMetadataType.TEXT
  | FieldMetadataType.NUMBER
  | FieldMetadataType.BOOLEAN
  | FieldMetadataType.DATE;

export interface OutputSchemaField {
  id: string;
  name: string;
  type: WorkflowOutputFieldType;
}

export const OUTPUT_FIELD_TYPE_OPTIONS: SelectOption<WorkflowOutputFieldType>[] =
  [
    {
      label: 'Text',
      value: FieldMetadataType.TEXT,
      Icon: IllustrationIconText,
    },
    {
      label: 'Number',
      value: FieldMetadataType.NUMBER,
      Icon: IllustrationIconNumbers,
    },
    {
      label: 'Boolean',
      value: FieldMetadataType.BOOLEAN,
    },
    {
      label: 'Date',
      value: FieldMetadataType.DATE,
      Icon: IllustrationIconCalendarEvent,
    },
  ];
