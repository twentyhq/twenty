import { ThemeColor } from 'twenty-ui';

export const enum RecordGroupDefinitionType {
  Value = 'value',
  NoValue = 'no-value',
}

export type RecordGroupDefinition = {
  id: string;
  fieldMetadataId: string;
  type: RecordGroupDefinitionType;
  title: string;
  value: string | null;
  color: ThemeColor | 'transparent';
  position: number;
  isVisible: boolean;
};
