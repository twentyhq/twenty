import { type FC } from 'react';

export type VariablePickerComponent = FC<{
  instanceId: string;
  disabled?: boolean;
  multiline?: boolean;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordObjects?: boolean;
  shouldDisplayRecordFields?: boolean;
  objectNameSingularsToSelect?: string[];
}>;
