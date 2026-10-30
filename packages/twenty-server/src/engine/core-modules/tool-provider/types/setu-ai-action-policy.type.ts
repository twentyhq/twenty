import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type SetuAiActionPolicyProposal = {
  toolName: string;
  toolCallId?: string;
} & (
  | { kind: 'send_email'; arguments: Record<string, unknown> }
  | {
      kind: 'update_record_fields';
      objectNameSingular: string;
      arguments: Record<string, unknown>;
    }
);

// Present only on contexts built by an enabled chat entrypoint. Its
// presence makes dispatch apply the reviewed-actions policy: supported
// writes become proposals, everything unclassified is refused.
export type SetuAiActionPolicy = {
  proposeAction: (proposal: SetuAiActionPolicyProposal) => Promise<ToolOutput>;
};
