import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';
import { type UnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-urls.type';

export const buildUnsubscribeHeaders = ({
  webUrl,
  mailtoUrl,
}: UnsubscribeUrls): EmailingDomainHeader[] => [
  { name: 'List-Unsubscribe', value: `<${webUrl}>, <${mailtoUrl}>` },
  { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
];
