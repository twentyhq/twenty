import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDuplicateDashboard } from '@/dashboards/hooks/useDuplicateDashboard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateDashboardSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { duplicateDashboard } = useDuplicateDashboard();
  const navigate = useNavigateApp();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to duplicate dashboard');
  }

  const handleExecute = async () => {
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

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
