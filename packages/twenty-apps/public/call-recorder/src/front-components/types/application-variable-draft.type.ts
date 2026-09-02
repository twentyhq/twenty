export type ApplicationVariableDraft = {
  inputValue: string;
  valueToSave: string | undefined;
};

export type ApplicationVariableDraftByKey = Record<
  string,
  ApplicationVariableDraft
>;

export type UpdateApplicationVariableDraft = (params: {
  variableKey: string;
  inputValue: string;
  valueToSave: string | undefined;
}) => void;
