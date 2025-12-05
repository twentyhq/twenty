import { type LanguageModelUsage } from 'ai';

export interface AgentExecutionResult {
  result: object;
  usage: LanguageModelUsage;
}
