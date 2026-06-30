import { UNSUBSCRIBE_MAILBOX_LOCAL_PART } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-mailbox.constant';
import { type UnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-urls.type';

type BuildUnsubscribeUrlsArgs = {
  unsubscribeHostname: string;
  domain: string;
  token: string;
};

export const buildUnsubscribeUrls = ({
  unsubscribeHostname,
  domain,
  token,
}: BuildUnsubscribeUrlsArgs): UnsubscribeUrls => ({
  httpsUrl: `https://${unsubscribeHostname}/emailing/unsubscribe?t=${token}`,
  mailtoUrl: `mailto:${UNSUBSCRIBE_MAILBOX_LOCAL_PART}@${domain}?subject=${token}`,
});
