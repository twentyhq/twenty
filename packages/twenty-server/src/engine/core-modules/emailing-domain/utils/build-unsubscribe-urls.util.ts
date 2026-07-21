import { UNSUBSCRIBE_MAILBOX_LOCAL_PART } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-mailbox.constant';
import { type UnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-urls.type';

type BuildUnsubscribeUrlsArgs = {
  unsubscribeBaseUrl: string;
  domain: string;
  token: string;
};

export const buildUnsubscribeUrls = ({
  unsubscribeBaseUrl,
  domain,
  token,
}: BuildUnsubscribeUrlsArgs): UnsubscribeUrls => ({
  webUrl: `${unsubscribeBaseUrl}/emailing/unsubscribe?t=${token}`,
  mailtoUrl: `mailto:${UNSUBSCRIBE_MAILBOX_LOCAL_PART}@${domain}?subject=${token}`,
});
