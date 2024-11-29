export type VariablePickerComponent = React.FC<{
  inputId: string;
  disabled?: boolean;
  multiline?: boolean;
  onVariableSelect: (variableName: string) => void;
}>;
