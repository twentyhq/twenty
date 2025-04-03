import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SeeWorkflowsNoSelectionRecordActionEffect = () => {
  const navigateApp = useNavigateApp();

  useEffect(() => {
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Workflow,
    });
  }, [navigateApp]);

  return null;
};
