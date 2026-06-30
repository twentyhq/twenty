import { type ThemeColor } from 'twenty-ui/theme';
export const enum RecordGroupDefinitionType {
  Value = 'value',
  NoValue = 'no-value',
}

export type RecordGroupDefinition = {
  id: string;
  type: RecordGroupDefinitionType;
  title: string;
  value: string | null;
  color: ThemeColor | 'transparent';
  position: number;
  isVisible: boolean;
};
