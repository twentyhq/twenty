import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';

export type UnsubscribeContent = {
  headers: EmailingDomainHeader[];
  textFooter: string;
  htmlFooter: string;
};
