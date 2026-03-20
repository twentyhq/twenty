import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

const EXTENSION_DAYS = 90;

export const ExtendSubscriptionAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useRecordIndexIdFromCurrentContextStore();
  const { t } = useLingui();

  const { record } = useFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
  });

  const { createOneRecord: createChangeRequest } = useCreateOneRecord({
    objectNameSingular:
      CoreObjectNameSingular.SubscriptionPeriodChangeRequest,
  });
  const { enqueueDialog } = useDialogManager();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const handleClick = () => {
    if (!record) {
      return;
    }

    const currentEndDate = record.endDate
      ? new Date(record.endDate as string)
      : new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + EXTENSION_DAYS);

    const currentEndDateStr = record.endDate
      ? currentEndDate.toLocaleDateString()
      : t`Not set`;
    const newEndDateStr = newEndDate.toLocaleDateString();

    enqueueDialog({
      title: t`Extend / Renew Subscription`,
      message: t`This will create a change request to extend by ${EXTENSION_DAYS} days.\n\nCurrent end date: ${currentEndDateStr}\nNew end date: ${newEndDateStr}\n\nRequires approval.`,
      buttons: [
        {
          title: t`Cancel`,
          variant: 'secondary',
        },
        {
          title: t`Create Request`,
          variant: 'primary',
          accent: 'blue',
          role: 'confirm',
          onClick: async () => {
            try {
              await createChangeRequest({
                subscriptionId: recordId,
                periodType: 'ACTIVE',
                startDate: currentEndDate.toISOString(),
                duration: EXTENSION_DAYS,
                reason: 'Extension / Renewal',
                requestStatus: 'PENDING',
                ...(isDefined(currentMember) && {
                  requestedById: currentMember.id,
                }),
              });

              enqueueSuccessSnackBar({
                message: t`Extension request created — pending approval`,
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Failed to create extension request`,
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
