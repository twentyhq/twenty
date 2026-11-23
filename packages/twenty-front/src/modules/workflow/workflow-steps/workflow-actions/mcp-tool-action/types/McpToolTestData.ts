import { type JsonObject } from 'type-fest';

export type McpToolTestData = {
  variableValues: { [variablePath: string]: string };
  output:
    | { status: 'idle' }
    | { status: 'success'; result: JsonObject }
    | { status: 'error'; error: string };
};
