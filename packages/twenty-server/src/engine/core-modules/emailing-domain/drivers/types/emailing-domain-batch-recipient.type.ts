import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';

export type EmailingDomainBatchRecipient = {
  email: string;
  replacements: Record<string, string>;
  headers?: EmailingDomainHeader[];
};
