import { type InputSchemaProperty } from 'twenty-shared/workflow';

export type ToolArgumentField = {
  name: string;
  label: string;
  description?: string;
  isRequired: boolean;
  // false for a saved argument the tool no longer lists, so it can still be read and removed
  isListed: boolean;
  // undefined when no simple input fits, such as an object or a union, so it is edited as JSON
  schemaProperty?: InputSchemaProperty;
};
