import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const GoToOpportunitiesNoSelectionRecordActionEffect = () => {
  const navigateApp = useNavigateApp();

  useActionEffect(() => {
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Opportunity,
    });
  }, [navigateApp]);

  return null;
};
