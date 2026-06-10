import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';

export type UnsubscribeContent = {
  headers: EmailingDomainHeader[];
  textFooter: string;
  htmlFooter: string;
};
