import type { ToolEvent } from './ToolEvent';

export type ParsedStep =
  | { type: 'tool'; events: ToolEvent[] }
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | { type: 'error'; message: string; error?: unknown };
