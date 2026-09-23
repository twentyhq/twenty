import { type ToolWidgetName } from 'twenty-shared/ai';

export type ToolWidget =
  | { kind: 'builtin'; name: ToolWidgetName }
  | { kind: 'front-component'; frontComponentId: string };
