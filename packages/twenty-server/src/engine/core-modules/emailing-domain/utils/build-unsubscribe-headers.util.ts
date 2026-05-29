import { UNSUBSCRIBE_MAILBOX_LOCAL_PART } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-mailbox.constant';
import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';

type BuildUnsubscribeHeadersArgs = {
  unsubscribeHostname: string;
  domain: string;
  token: string;
};

export const buildUnsubscribeHeaders = ({
  unsubscribeHostname,
  domain,
  token,
}: BuildUnsubscribeHeadersArgs): EmailingDomainHeader[] => {
  const httpsUrl = `https://${unsubscribeHostname}/emailing/unsubscribe?t=${token}`;
  const mailtoUrl = `mailto:${UNSUBSCRIBE_MAILBOX_LOCAL_PART}@${domain}?subject=${token}`;

  return [
    {
      name: 'List-Unsubscribe',
      value: `<${httpsUrl}>, <${mailtoUrl}>`,
    },
    {
      name: 'List-Unsubscribe-Post',
      value: 'List-Unsubscribe=One-Click',
    },
  ];
};
