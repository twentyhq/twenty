import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';
import { type UnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-urls.type';

export const buildUnsubscribeHeaders = ({
  httpsUrl,
  mailtoUrl,
}: UnsubscribeUrls): EmailingDomainHeader[] => [
  { name: 'List-Unsubscribe', value: `<${httpsUrl}>, <${mailtoUrl}>` },
  { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
];
