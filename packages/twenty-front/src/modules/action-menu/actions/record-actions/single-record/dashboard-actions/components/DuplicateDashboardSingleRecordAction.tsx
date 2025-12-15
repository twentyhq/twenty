import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDuplicateDashboard } from '@/dashboards/hooks/useDuplicateDashboard';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { duplicateDashboard } = useDuplicateDashboard();
  const navigate = useNavigateApp();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const handleClick = async () => {
    const result = await duplicateDashboard(recordId);

    if (isDefined(result) && isNonEmptyString(result.id)) {
      enqueueSuccessSnackBar({
        message: t`Dashboard duplicated successfully`,
      });
      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Dashboard,
        objectRecordId: result.id,
      });
    } else {
      enqueueErrorSnackBar({
        message: t`Failed to duplicate dashboard`,
      });
    }
  };

  return <Action onClick={handleClick} />;
};
