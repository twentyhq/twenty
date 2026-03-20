import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecalculateSubscription } from '@/action-menu/actions/record-actions/single-record/subscription-actions/hooks/useRecalculateSubscription';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const ApproveChangeRequestAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { record: changeRequest } = useFindOneRecord({
    objectNameSingular:
      CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
    objectRecordId: recordId,
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

    const subscriptionId = changeRequest.subscriptionId;
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
              // 1. Mark Change Request as approved
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

              const duration = changeRequest.duration as number;
              const pauseEndDate = new Date(
                requestStartDate.getTime() + duration * MS_PER_DAY,
              );

              const createdPeriods: Array<{
                id: string;
                periodType: string;
                startDate: string;
                endDate: string | null;
              }> = [];

              if (changeRequest.periodType === 'PAUSE') {
                // Create pause period
                const pausePeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'PAUSE',
                  startDate: requestStartDate.toISOString(),
                  endDate: pauseEndDate.toISOString(),
                  source: 'CHANGE_REQUEST',
                  changeRequestId: recordId,
                });
                createdPeriods.push({
                  id: pausePeriod.id as string,
                  periodType: 'PAUSE',
                  startDate: requestStartDate.toISOString(),
                  endDate: pauseEndDate.toISOString(),
                });

                // Create resumption active period
                const resumptionPeriod = await createPeriod({
                  subscriptionId,
                  periodType: 'ACTIVE',
                  startDate: pauseEndDate.toISOString(),
                  endDate: null,
                  source: 'CHANGE_REQUEST',
                  changeRequestId: recordId,
                });
                createdPeriods.push({
                  id: resumptionPeriod.id as string,
                  periodType: 'ACTIVE',
                  startDate: pauseEndDate.toISOString(),
                  endDate: null,
                });
              } else {
                // EXTENSION: create new active period
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
                createdPeriods.push({
                  id: extensionPeriod.id as string,
                  periodType: 'ACTIVE',
                  startDate: requestStartDate.toISOString(),
                  endDate: extensionEndDate.toISOString(),
                });
              }

              // TODO: After migration (step 7 with Pablo), fetch ALL periods
              // for the subscription instead of just newly created ones.
              await recalculate(subscriptionId, createdPeriods, 0);

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
