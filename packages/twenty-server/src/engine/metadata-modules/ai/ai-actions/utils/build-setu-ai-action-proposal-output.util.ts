import { type SetuInteractionResult } from 'twenty-shared/ai';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';

// `success` means a proposal exists, not that anything ran; the message says
// so in words the model will repeat to the person.
export const buildSetuAiActionProposalOutput = (
  action: SetuAiActionRequestEntity,
): ToolOutput<SetuInteractionResult> => ({
  success: true,
  message:
    action.kind === 'send_email'
      ? 'Email prepared for review. Nothing has been sent; the user must approve it in the review card, which already shows the full draft. Reply in one short sentence and do not repeat the email.'
      : 'Record change prepared for review. Nothing has changed yet; the user must approve it in the review card, which already shows the values. Reply in one short sentence and do not repeat the change.',
  result: {
    interaction: {
      schemaVersion: 1,
      kind: 'action-review',
      actionRequestId: action.id,
    },
  },
});

export const buildSetuAiActionProposalFailureOutput = (
  error: unknown,
): ToolOutput => {
  if (error instanceof SetuAiActionException) {
    return {
      success: false,
      message: 'The action could not be prepared',
      error: `${error.code}: ${error.message}`,
    };
  }

  throw error;
};
