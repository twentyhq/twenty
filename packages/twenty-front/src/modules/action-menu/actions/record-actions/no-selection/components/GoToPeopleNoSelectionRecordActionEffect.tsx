import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const GoToPeopleNoSelectionRecordActionEffect = () => {
  const navigateApp = useNavigateApp();

  useEffect(() => {
    navigateApp(AppPath.RecordIndexPage, {
      objectNamePlural: CoreObjectNamePlural.Person,
    });
  }, [navigateApp]);

  return null;
};
