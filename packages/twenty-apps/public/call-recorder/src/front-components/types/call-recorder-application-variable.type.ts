export type CallRecorderApplicationVariableOption = {
  label: string;
  value: string;
};

export type CallRecorderApplicationVariable = {
  key: string;
  label: string;
  value: string;
  description: string;
  isSecret: boolean;
  isDeprecated: boolean;
  type: string;
  options: CallRecorderApplicationVariableOption[] | null;
};
