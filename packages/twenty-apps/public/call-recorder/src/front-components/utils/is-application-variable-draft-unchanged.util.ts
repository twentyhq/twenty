export const isApplicationVariableDraftUnchanged = ({
  persistedValue,
  valueToSave,
  isSecret,
}: {
  persistedValue: string;
  valueToSave: string;
  isSecret: boolean;
}): boolean => !isSecret && valueToSave === persistedValue;
