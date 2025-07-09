export type VariablePickerComponent = React.FC<{
  instanceId: string;
  disabled?: boolean;
  multiline?: boolean;
  onVariableSelect: (variableName: string) => void;
  objectNameSingularToSelect?: string;
}>;
