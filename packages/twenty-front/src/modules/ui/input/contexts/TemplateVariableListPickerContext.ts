import { createContext } from 'react';

export const TemplateVariableListPickerContext = createContext<{
  variables: { label: string; name: string }[];
  formatTemplateVariable: (name: string) => string;
} | null>(null);
