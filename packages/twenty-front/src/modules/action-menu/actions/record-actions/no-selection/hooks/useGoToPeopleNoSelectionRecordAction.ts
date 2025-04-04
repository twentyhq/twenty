import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { AppPath } from '@/types/AppPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useGoToPeopleNoSelectionRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const navigateApp = useNavigateApp();

    const onClick = () => {
      navigateApp(AppPath.RecordIndexPage, {
        objectNamePlural: CoreObjectNamePlural.Person,
      });
    };

    return {
      onClick,
    };
  };
