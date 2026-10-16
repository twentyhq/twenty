/* @license Enterprise */

import { type BillingSeatChangeEntity } from 'src/engine/core-modules/billing/entities/billing-seat-change.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

export const computePlanAllowanceMicro = ({
  workspaceCreditsPerSeat = 0,
  seats,
  interval,
  periodStart,
  periodEnd,
  seatChanges,
  packCreditsMicro,
  atPeriodStart = false,
}: {
  workspaceCreditsPerSeat?: number;
  atPeriodStart?: boolean;
  seats: number;
  interval: SubscriptionInterval;
  periodStart: Date;
  periodEnd: Date;
  seatChanges: Pick<
    BillingSeatChangeEntity,
    'previousSeats' | 'seats' | 'changedAt'
  >[];
  packCreditsMicro: number;
}): {
  planAllowanceMicro: number | null;
  workspaceCreditsGrantedForSeats: number;
} => {
  const duration = periodEnd.getTime() - periodStart.getTime();
  const weightedSeats = seatChanges.reduce((total, change) => {
    if (change.changedAt < periodStart) {
      return total;
    }

    // Later changes must be undone entirely to recover the closing period's seat count.
    const elapsed = atPeriodStart
      ? change.changedAt > periodStart
        ? 1
        : 0
      : duration > 0
        ? Math.min(
            1,
            Math.max(
              0,
              (change.changedAt.getTime() - periodStart.getTime()) / duration,
            ),
          )
        : 0;

    return total - (change.seats - change.previousSeats) * elapsed;
  }, seats);
  const workspaceCreditsGrantedForSeats = Math.floor(
    workspaceCreditsPerSeat *
      (interval === SubscriptionInterval.Year ? 12 : 1) *
      Math.max(0, weightedSeats),
  );
  const total = packCreditsMicro + workspaceCreditsGrantedForSeats;

  return {
    planAllowanceMicro: total > 0 ? total : null,
    workspaceCreditsGrantedForSeats,
  };
};
