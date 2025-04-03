import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const GoToCompaniesNoSelectionRecordActionEffect = () => {
  const navigateApp = useNavigateApp();

  useEffect(() => {
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Company,
    });
  }, [navigateApp]);

  return null;
};
