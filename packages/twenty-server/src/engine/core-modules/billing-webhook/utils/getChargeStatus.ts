import { ChargeStatus } from 'src/engine/core-modules/billing/enums/billing-charge.status.enum';
import { InterChargeStatus } from 'src/engine/core-modules/inter/enums/InterChargeStatus.enum';

export const getChargeStatusFromInterChargeStatus = (
  status: InterChargeStatus,
) => {
  switch (status) {
    case InterChargeStatus.RECEBIDO:
      return ChargeStatus.PAID;
    default:
      return ChargeStatus.UNPAID;
  }
};
