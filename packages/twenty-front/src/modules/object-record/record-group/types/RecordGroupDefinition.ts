import { ThemeColor } from 'twenty-ui';

import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupAction';

export const enum RecordGroupDefinitionType {
  Value = 'value',
  NoValue = 'no-value',
}

export type RecordGroupDefinitionNoValue = {
  id: 'no-value';
  fieldMetadataId: string;
  type: RecordGroupDefinitionType.NoValue;
  title: 'No Value';
  position: number;
  value: null;
  actions: RecordGroupAction[];
};

export type RecordGroupDefinitionValue = {
  id: string;
  fieldMetadataId: string;
  type: RecordGroupDefinitionType.Value;
  title: string;
  value: string;
  color: ThemeColor;
  position: number;
  actions: RecordGroupAction[];
};

export type RecordGroupDefinition =
  | RecordGroupDefinitionValue
  | RecordGroupDefinitionNoValue;
