import { StandardObjectNameSingular } from 'twenty-shared/types';
import { type TipTapNode } from 'twenty-shared/utils';

export const isAiChatParticipantMentionAttributes = (
  attributes: TipTapNode['attrs'],
): boolean =>
  attributes?.objectNameSingular ===
    StandardObjectNameSingular.WorkspaceMember &&
  attributes?.shouldAddAsParticipant === true;
