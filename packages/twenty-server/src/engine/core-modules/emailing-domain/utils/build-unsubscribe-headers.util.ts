import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';

type BuildUnsubscribeHeadersArgs = {
  webUrl: string;
};

export const buildUnsubscribeHeaders = ({
  webUrl,
}: BuildUnsubscribeHeadersArgs): EmailingDomainHeader[] => [
  { name: 'List-Unsubscribe', value: `<${webUrl}>` },
  { name: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' },
];
