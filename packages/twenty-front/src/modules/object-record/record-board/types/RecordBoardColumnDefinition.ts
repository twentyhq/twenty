import { ThemeColor } from 'twenty-ui';

import { RecordBoardColumnAction } from '@/object-record/record-board/types/RecordBoardColumnAction';

export const enum RecordBoardColumnDefinitionType {
  Value = 'value',
  NoValue = 'no-value',
}

export type RecordBoardColumnDefinitionNoValue = {
  id: 'no-value';
  type: RecordBoardColumnDefinitionType.NoValue;
  title: 'No Value';
  position: number;
  value: null;
  actions: RecordBoardColumnAction[];
};

export type RecordBoardColumnDefinitionValue = {
  id: string;
  type: RecordBoardColumnDefinitionType.Value;
  title: string;
  value: string;
  color: ThemeColor;
  position: number;
  actions: RecordBoardColumnAction[];
};

export type RecordBoardColumnDefinition =
  | RecordBoardColumnDefinitionValue
  | RecordBoardColumnDefinitionNoValue;
