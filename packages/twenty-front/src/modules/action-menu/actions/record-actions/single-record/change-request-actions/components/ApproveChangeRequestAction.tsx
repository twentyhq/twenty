import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecalculateSubscription } from '@/action-menu/actions/record-actions/single-record/subscription-actions/hooks/useRecalculateSubscription';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type PeriodRecord = {
  id: string;
  periodType: string;
  startDate: string;
  endDate: string | null;
  source: string;
};

export const ApproveChangeRequestAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { record: changeRequest } = useFindOneRecord({
    objectNameSingular:
      CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
    objectRecordId: recordId,
  });

  const subscriptionId = changeRequest?.subscriptionId as string | undefined;

  // Fetch the parent subscription (to get startDate/endDate for lazy init)
  const { record: subscription } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.TobSubscription,
    objectRecordId: subscriptionId ?? '',
    skip: !isDefined(subscriptionId),
  });

  // Fetch ALL existing periods for this subscription
  const { records: existingPeriods } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.SubscriptionPeriod,
    filter: isDefined(subscriptionId)
      ? { subscriptionId: { eq: subscriptionId } }
      : undefined,
    skip: !isDefined(subscriptionId),
    limit: 200,
  });

  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createPeriod } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.SubscriptionPeriod,
  });
  const { enqueueDialog } = useDialogManager();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { recalculate } = useRecalculateSubscription();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const handleClick = () => {
    if (!changeRequest || changeRequest.requestStatus !== 'PENDING') {
      return;
    }

    if (!isDefined(subscriptionId)) {
      enqueueErrorSnackBar({
        message: 'Cannot approve: no subscription linked',
      });

      return;
    }

    const requestStartDate = new Date(changeRequest.startDate as string);
    const now = new Date();

    // Validation: no past-date pauses
    if (
      changeRequest.periodType === 'PAUSE' &&
      requestStartDate.getTime() < now.getTime() - MS_PER_DAY
    ) {
      enqueueErrorSnackBar({
        message: 'Cannot approve: pause start date is in the past',
      });

      return;
    }

    // Validation: no pause during pause
    if (changeRequest.periodType === 'PAUSE' && existingPeriods.length > 0) {
      const coveringPeriod = existingPeriods.find((period) => {
        const start = new Date(period.startDate as string).getTime();
        const end = isDefined(period.endDate)
          ? new Date(period.endDate as string).getTime()
          : Infinity;

        return (
          requestStartDate.getTime() >= start &&
          requestStartDate.getTime() < end
        );
      });

      if (isDefined(coveringPeriod) && coveringPeriod.periodType === 'PAUSE') {
        enqueueErrorSnackBar({
          message: 'Cannot approve: subscription is already paused at this date',
        });

        return;
      }
    }

    enqueueDialog({
      title: 'Approve Change Request',
      message: `Approve this ${changeRequest.periodType === 'PAUSE' ? 'pause' : 'extension'} request for ${changeRequest.duration} days?`,
      buttons: [
        { title: 'Cancel', variant: 'secondary' },
        {
          title: 'Approve',
          variant: 'primary',
          accent: 'blue',
          role: 'confirm',
          onClick: async () => {
            try {
              // 1. Lazy initialization: if no periods exist yet (Dagster-created
              // or pre-migration subscription), create an initial period from
              // the subscription's startDate/endDate
              let allPeriods: PeriodRecord[] = existingPeriods.map(
                (period) => ({
                  id: period.id as string,
                  periodType: period.periodType as string,
                  startDate: period.startDate as string,
                  endDate: period.endDate as string | null,
                  source: period.source as string,
                }),
              );

              if (
                allPeriods.length === 0 &&
                isDefined(subscription) &&
                isDefined(subscription.startDate)
              ) {
                const initialPeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'ACTIVE',
                  startDate: (subscription.startDate as string),
                  endDate: isDefined(subscription.endDate)
                    ? (subscription.endDate as string)
                    : null,
                  source: 'CONTRACT',
                });
                allPeriods.push({
                  id: initialPeriod.id as string,
                  periodType: 'ACTIVE',
                  startDate: subscription.startDate as string,
                  endDate: isDefined(subscription.endDate)
                    ? (subscription.endDate as string)
                    : null,
                  source: 'CONTRACT',
                });
              }

              const duration = changeRequest.duration as number;

              if (changeRequest.periodType === 'PAUSE') {
                // 3a. Find the active period that covers the pause start date
                const coveringPeriodIndex = allPeriods.findIndex((period) => {
                  const start = new Date(period.startDate).getTime();
                  const end = isDefined(period.endDate)
                    ? new Date(period.endDate).getTime()
                    : Infinity;

                  return (
                    period.periodType === 'ACTIVE' &&
                    requestStartDate.getTime() >= start &&
                    requestStartDate.getTime() < end
                  );
                });

                if (coveringPeriodIndex === -1) {
                  enqueueErrorSnackBar({
                    message:
                      'Cannot approve: no active period covers the pause start date',
                  });

                  return;
                }

                const coveringPeriod = allPeriods[coveringPeriodIndex];
                const originalEndDate = coveringPeriod.endDate;
                const pauseEndDate = new Date(
                  requestStartDate.getTime() + duration * MS_PER_DAY,
                );

                // Calculate resumption end date: original end + pause duration
                const resumptionEndDate = isDefined(originalEndDate)
                  ? new Date(
                      new Date(originalEndDate).getTime() +
                        duration * MS_PER_DAY,
                    )
                  : null;

                // 3b. Shorten the existing active period
                await updateOneRecord({
                  objectNameSingular: CoreObjectNameSingular.SubscriptionPeriod,
                  idToUpdate: coveringPeriod.id,
                  updateOneRecordInput: {
                    endDate: requestStartDate.toISOString(),
                  },
                });
                allPeriods[coveringPeriodIndex] = {
                  ...coveringPeriod,
                  endDate: requestStartDate.toISOString(),
                };

                // 3c. Create pause period
                const pausePeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'PAUSE',
                  startDate: requestStartDate.toISOString(),
                  endDate: pauseEndDate.toISOString(),
                  source: 'CHANGE_REQUEST',
                  changeRequestId: recordId,
                });
                allPeriods.push({
                  id: pausePeriod.id as string,
                  periodType: 'PAUSE',
                  startDate: requestStartDate.toISOString(),
                  endDate: pauseEndDate.toISOString(),
                  source: 'CHANGE_REQUEST',
                });

                // 3d. Create resumption active period with concrete end date
                const resumptionPeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'ACTIVE',
                  startDate: pauseEndDate.toISOString(),
                  endDate: isDefined(resumptionEndDate)
                    ? resumptionEndDate.toISOString()
                    : null,
                  source: 'CHANGE_REQUEST',
                  changeRequestId: recordId,
                });
                allPeriods.push({
                  id: resumptionPeriod.id as string,
                  periodType: 'ACTIVE',
                  startDate: pauseEndDate.toISOString(),
                  endDate: isDefined(resumptionEndDate)
                    ? resumptionEndDate.toISOString()
                    : null,
                  source: 'CHANGE_REQUEST',
                });
              } else {
                // 4. EXTENSION: create new active period
                const extensionEndDate = new Date(
                  requestStartDate.getTime() + duration * MS_PER_DAY,
                );

                const extensionPeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'ACTIVE',
                  startDate: requestStartDate.toISOString(),
                  endDate: extensionEndDate.toISOString(),
                  source: 'CHANGE_REQUEST',
                  changeRequestId: recordId,
                });
                allPeriods.push({
                  id: extensionPeriod.id as string,
                  periodType: 'ACTIVE',
                  startDate: requestStartDate.toISOString(),
                  endDate: extensionEndDate.toISOString(),
                  source: 'CHANGE_REQUEST',
                });
              }

              // 5. Mark Change Request as approved (after periods are
              // created so we don't end up with an approved CR but no periods
              // if period creation fails)
              await updateOneRecord({
                objectNameSingular:
                  CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
                idToUpdate: recordId,
                updateOneRecordInput: {
                  requestStatus: 'APPROVED',
                  processedAt: new Date().toISOString(),
                  ...(isDefined(currentMember) && {
                    processedById: currentMember.id,
                  }),
                },
              });

              // 6. Recalculate with ALL periods
              const historicalPauseDays =
                isDefined(subscription) &&
                isDefined(subscription.historicalPauseDays) &&
                typeof subscription.historicalPauseDays === 'number'
                  ? subscription.historicalPauseDays
                  : 0;

              await recalculate(subscriptionId, allPeriods, historicalPauseDays);

              enqueueSuccessSnackBar({
                message: 'Change request approved — subscription updated',
              });
            } catch {
              enqueueErrorSnackBar({
                message: 'Failed to approve change request',
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
