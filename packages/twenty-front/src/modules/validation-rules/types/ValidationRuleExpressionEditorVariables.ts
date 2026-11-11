import { type ReactNode } from 'react';

import { type ValidationRuleFieldNodeAttributes } from '@/validation-rules/types/ValidationRuleFieldNodeAttributes';

export type ValidationRuleExpressionEditorVariables = {
  getVariableNodeAttributes: (
    variable: string,
  ) => ValidationRuleFieldNodeAttributes | null;
  renderVariablePicker: (
    onVariableSelect: (variable: string) => void,
  ) => ReactNode;
};
