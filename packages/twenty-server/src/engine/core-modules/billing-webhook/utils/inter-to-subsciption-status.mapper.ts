import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { InterChargeStatus } from 'src/engine/core-modules/inter/enums/InterChargeStatus.enum';

export const interToSubscriptionStatusMap: Record<
  InterChargeStatus,
  SubscriptionStatus
> = {
  [InterChargeStatus.A_RECEBER]: SubscriptionStatus.Unpaid,
  [InterChargeStatus.RECEBIDO]: SubscriptionStatus.Active,
  [InterChargeStatus.ATRASADO]: SubscriptionStatus.Unpaid,
  [InterChargeStatus.CANCELADO]: SubscriptionStatus.Canceled,
  [InterChargeStatus.EXPIRADO]: SubscriptionStatus.Canceled,
  [InterChargeStatus.MARCADO_RECEBIDO]: SubscriptionStatus.Trialing,
  [InterChargeStatus.FALHA_EMISSAO]: SubscriptionStatus.Unpaid,
  [InterChargeStatus.EM_PROCESSAMENTO]: SubscriptionStatus.Incomplete,
  [InterChargeStatus.PROTESTO]: SubscriptionStatus.Unpaid,
};
