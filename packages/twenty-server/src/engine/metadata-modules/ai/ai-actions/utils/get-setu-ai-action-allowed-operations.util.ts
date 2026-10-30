import {
  type SetuAiActionOperation,
  type SetuAiActionStatus,
} from 'twenty-shared/ai';

// A queued action can still be stopped or revised because no worker has
// claimed it; once running, nothing may promise to stop it.
export const getSetuAiActionAllowedOperations = (
  status: SetuAiActionStatus,
): SetuAiActionOperation[] => {
  switch (status) {
    case 'pending_review':
      return ['revise', 'approve', 'reject'];
    case 'queued':
      return ['revise', 'cancel'];
    default:
      return [];
  }
};
