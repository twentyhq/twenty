import {
  type LanguageModelUsage,
  type ToolSet,
  type TypedToolCall,
  type TypedToolResult,
} from 'ai';

export interface AgentExecutionResult {
  result: object;
  toolCalls?: TypedToolCall<ToolSet>[];
  toolResults?: TypedToolResult<ToolSet>[];
  usage: LanguageModelUsage;
}
