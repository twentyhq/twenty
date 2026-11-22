import { StandardObjectNameSingular } from 'twenty-shared/types';

export const isAiChatParticipantMentionAttributes = (
  attributes: Record<string, unknown> | undefined,
): boolean =>
  attributes?.objectNameSingular ===
    StandardObjectNameSingular.WorkspaceMember &&
  attributes?.shouldAddAsParticipant === true;
