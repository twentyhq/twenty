export type VariablePickerComponent = React.FC<{
  instanceId: string;
  disabled?: boolean;
  multiline?: boolean;
  onVariableSelect: (variableName: string) => void;
  shouldDisplayRecordObjects?: boolean;
  shouldDisplayRecordFields?: boolean;
  // When provided, only records belonging to these objects can be picked.
  // Used by relation fields to restrict the picker to the expected target objects.
  objectNameSingularsToSelect?: string[];
}>;
