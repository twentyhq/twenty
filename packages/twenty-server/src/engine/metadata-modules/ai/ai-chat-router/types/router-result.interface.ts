import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

import { type ToolHints } from './tool-hints.interface';

export type PlanStep = {
  stepNumber: number;
  agentName: string;
  task: string;
  expectedOutput: string;
  dependsOn?: number[];
};

export type ExecutionPlan = {
  steps: PlanStep[];
  reasoning: string;
};

export type RouterDebugInfo = {
  availableAgents: Array<{ id: string; label: string }>;
  routerModel: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type SimpleRouterResult = {
  strategy: 'simple';
  agent: AgentEntity;
  toolHints?: ToolHints;
  debugInfo?: RouterDebugInfo;
};

export type PlannedRouterResult = {
  strategy: 'planned';
  plan: ExecutionPlan;
  debugInfo?: RouterDebugInfo;
};

export type UnifiedRouterResult = SimpleRouterResult | PlannedRouterResult;
