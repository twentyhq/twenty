import { getApplicationVariable } from 'twenty-sdk/front-component';

export const getApplicationVariableValue = (variableKey: string): string =>
  getApplicationVariable(variableKey) ?? '';
