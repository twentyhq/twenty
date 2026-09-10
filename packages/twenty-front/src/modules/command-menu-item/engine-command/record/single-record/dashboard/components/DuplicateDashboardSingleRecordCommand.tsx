import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDuplicateDashboard } from '@/dashboards/hooks/useDuplicateDashboard';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateDashboardSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { duplicateDashboard } = useDuplicateDashboard();
  const navigate = useNavigateApp();
  const { add: addToast } = useToast();
  const { t } = useLingui();

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to duplicate dashboard');
  }

  const handleExecute = async () => {
    const result = await duplicateDashboard(recordId);

    if (isDefined(result) && isNonEmptyString(result.id)) {
      addToast({
        variant: 'success',
        children: t`Dashboard duplicated successfully`,
      });

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Dashboard,
        objectRecordId: result.id,
      });
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
