import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

export const RejectChangeRequestAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const { record: changeRequest } = useFindOneRecord({
    objectNameSingular:
      CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
    objectRecordId: recordId,
  });

  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueDialog } = useDialogManager();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const handleClick = () => {
    if (!changeRequest || changeRequest.requestStatus !== 'PENDING') {
      return;
    }

    enqueueDialog({
      title: 'Reject Change Request',
      message:
        'Are you sure you want to reject this change request? The subscription will remain unchanged.',
      buttons: [
        { title: 'Cancel', variant: 'secondary' },
        {
          title: 'Reject',
          variant: 'primary',
          accent: 'danger',
          role: 'confirm',
          onClick: async () => {
            try {
              await updateOneRecord({
                objectNameSingular:
                  CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
                idToUpdate: recordId,
                updateOneRecordInput: {
                  requestStatus: 'REJECTED',
                  processedAt: new Date().toISOString(),
                  ...(isDefined(currentMember) && {
                    processedById: currentMember.id,
                  }),
                },
              });

              enqueueSuccessSnackBar({
                message: 'Change request rejected',
              });
            } catch {
              enqueueErrorSnackBar({
                message: 'Failed to reject change request',
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
