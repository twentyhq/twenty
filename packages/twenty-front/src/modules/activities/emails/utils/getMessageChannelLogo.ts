import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconGmail,
  IconLinkedin,
  IconMail,
  IconMessage,
  IconMicrosoftOutlook,
  IconWhatsapp,
} from 'twenty-ui/icon';
import {
  MessageChannelType,
  type TimelineThreadChannel,
} from '~/generated/graphql';

const LOGO_BY_CONNECTION_PROVIDER_NAME: Partial<
  Record<string, typeof IconWhatsapp>
> = {
  linkedin: IconLinkedin,
  whatsapp: IconWhatsapp,
};

export const getMessageChannelLogo = (
  channel: TimelineThreadChannel | null | undefined,
) => {
  if (!isDefined(channel)) {
    return IconMail;
  }

  const connectionProviderLogo = isDefined(channel.connectionProviderName)
    ? LOGO_BY_CONNECTION_PROVIDER_NAME[channel.connectionProviderName]
    : undefined;

  if (isDefined(connectionProviderLogo)) {
    return connectionProviderLogo;
  }

  if (channel.type === MessageChannelType.APP) {
    return IconMessage;
  }

  switch (channel.provider) {
    case ConnectedAccountProvider.GOOGLE:
      return IconGmail;
    case ConnectedAccountProvider.MICROSOFT:
      return IconMicrosoftOutlook;
    default:
      return IconMail;
  }
};
