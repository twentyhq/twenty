import { type FlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const assertAgentChatChannelOwnedByApplicationOrThrow = ({
  channel,
  applicationId,
}: {
  channel: Pick<FlatAgentChatChannel, 'applicationId'>;
  applicationId: string;
}): void => {
  if (channel.applicationId !== applicationId) {
    throw new AiException(
      'Another application owns a channel with this universal identifier',
      AiExceptionCode.CHAT_CHANNEL_UNIVERSAL_IDENTIFIER_TAKEN,
    );
  }
};
