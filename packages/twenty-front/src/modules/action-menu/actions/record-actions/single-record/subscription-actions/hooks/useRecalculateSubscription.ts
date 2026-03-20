import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type SubscriptionPeriodRecord = {
  id: string;
  periodType: string;
  startDate: string;
  endDate: string | null;
};

const computeAccessStatus = (
  status: string,
  inactiveReason: string | null,
): string => {
  if (status === 'ACTIVE') {
    return 'ACTIVE';
  }

  if (inactiveReason === 'PAUSE') {
    return 'PAUSED';
  }

  // Contract expiry (no explicit reason) defaults to NOT_GRANTED
  if (!isDefined(inactiveReason)) {
    return 'NOT_GRANTED';
  }

  return 'WITHDRAWN';
};

export const useRecalculateSubscription = () => {
  const { updateOneRecord } = useUpdateOneRecord();

  const recalculate = useCallback(
    async (
      subscriptionId: string,
      periods: SubscriptionPeriodRecord[],
      historicalPauseDays: number = 0,
    ) => {
      if (periods.length === 0) {
        return;
      }

      // Sort by startDate ascending
      const sorted = [...periods].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      // finalEndDate = max endDate across all periods
      let maxEndDate: Date | null = null;
      let hasOpenEndedPeriod = false;

      for (const period of sorted) {
        if (!isDefined(period.endDate)) {
          hasOpenEndedPeriod = true;
          continue;
        }

        const end = new Date(period.endDate);

        if (!isDefined(maxEndDate) || end.getTime() > maxEndDate.getTime()) {
          maxEndDate = end;
        }
      }

      // pauseDays = sum of pause durations + historical
      let pauseDays = historicalPauseDays;

      for (const period of sorted) {
        if (
          period.periodType === 'PAUSE' &&
          isDefined(period.startDate) &&
          isDefined(period.endDate)
        ) {
          const start = new Date(period.startDate).getTime();
          const end = new Date(period.endDate).getTime();
          pauseDays += Math.round((end - start) / MS_PER_DAY);
        }
      }

      // status: ACTIVE if open-ended or max endDate is in the future
      const now = new Date();
      const isActive =
        hasOpenEndedPeriod ||
        (isDefined(maxEndDate) && maxEndDate.getTime() > now.getTime());
      const subscriptionStatus = isActive ? 'ACTIVE' : 'INACTIVE';

      // inactiveReason: if INACTIVE and last period by startDate is a pause -> PAUSE
      const lastPeriod = sorted[sorted.length - 1];
      const inactiveReason =
        !isActive && lastPeriod.periodType === 'PAUSE' ? 'PAUSE' : null;

      // accessStatus: mapped from status + reason
      const accessStatus = computeAccessStatus(
        subscriptionStatus,
        inactiveReason,
      );

      const endDateIso =
        !hasOpenEndedPeriod && isDefined(maxEndDate)
          ? maxEndDate.toISOString()
          : null;

      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.TobSubscription,
        idToUpdate: subscriptionId,
        updateOneRecordInput: {
          subscriptionStatus,
          inactiveReason: isDefined(inactiveReason) ? inactiveReason : null,
          // Write to both finalEndDate (new) and endDate (old) so smart views
          // like "Expiring in 60 Days" keep working during the transition
          ...(isDefined(endDateIso) && {
            finalEndDate: endDateIso,
            endDate: endDateIso,
          }),
          pauseDays,
          accessStatus,
        },
      });
    },
    [updateOneRecord],
  );

  return { recalculate };
};
