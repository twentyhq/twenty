export type ApplicationVariablesSaveResult =
  | { isSaved: false }
  | { isSaved: true; hasMissingRequiredVariables: boolean };
