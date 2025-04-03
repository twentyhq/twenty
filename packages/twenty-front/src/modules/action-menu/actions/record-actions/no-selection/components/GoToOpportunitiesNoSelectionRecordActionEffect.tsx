import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const GoToOpportunitiesNoSelectionRecordActionEffect = () => {
  const navigateApp = useNavigateApp();

  useEffect(() => {
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Opportunity,
    });
  }, [navigateApp]);

  return null;
};
