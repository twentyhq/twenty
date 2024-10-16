import { ThemeColor } from 'twenty-ui';

export const enum RecordGroupDefinitionType {
  Value = 'value',
  NoValue = 'no-value',
}

export type RecordGroupDefinitionNoValue = {
  id: 'no-value';
  type: RecordGroupDefinitionType.NoValue;
  title: 'No Value';
  position: number;
  value: null;
  isVisible: boolean;
};

export type RecordGroupDefinitionValue = {
  id: string;
  fieldMetadataId: string;
  type: RecordGroupDefinitionType.Value;
  title: string;
  value: string;
  color: ThemeColor;
  position: number;
  isVisible: boolean;
};

export type RecordGroupDefinition =
  | RecordGroupDefinitionValue
  | RecordGroupDefinitionNoValue;
