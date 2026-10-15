import { type AgentRunOutcomeDelivery } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-outcome-delivery.type';

export type DeliverAgentRunOutcomeJobData = AgentRunOutcomeDelivery & {
  attempt: number;
};
