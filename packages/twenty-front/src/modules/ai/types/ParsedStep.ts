import type { ToolEvent } from 'twenty-shared/ai';

export type ParsedStep =
  | { type: 'tool'; events: ToolEvent[] }
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | { type: 'error'; message: string; error?: unknown };
