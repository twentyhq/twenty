import { MessageChannelVisibility } from 'twenty-shared/types';

export const getEffectiveMessageChannelVisibility = ({
  visibility,
  isOwnedByCurrentUser,
}: {
  visibility: MessageChannelVisibility;
  isOwnedByCurrentUser: boolean;
}): MessageChannelVisibility =>
  isOwnedByCurrentUser ? MessageChannelVisibility.SHARE_EVERYTHING : visibility;
