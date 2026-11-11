import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { type AgentRunFileLoader } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-file-loader.type';
import { type ModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/model-file-limits.type';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

export type AgentFileDeliveryState = {
  modelId: ModelId;
  workspaceId: string;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
  limits: ModelFileLimits;
  nativeMimeTypes: Set<string>;
  fileLoader: AgentRunFileLoader;
  canSendSignedUrls: boolean;
  areFilesRejected: boolean;
  deliveredFileIds: Set<string>;
  rejectedFileIds: Set<string>;
};
