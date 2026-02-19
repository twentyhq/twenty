import { GoToHotkeyItemEffect } from '@/app/effect-components/GoToHotkeyItemEffect';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedStateV2 } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedStateV2';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';

export const GotoHotkeysEffectsProvider = () => {
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const store = useStore();

  useGoToHotkeys({
    key: 's',
    location: getSettingsPath(SettingsPath.ProfilePage),
    preNavigateFunction: useCallback(() => {
      store.set(isNavigationDrawerExpandedState.atom, true);
      store.set(navigationDrawerExpandedMemorizedStateV2.atom, true);
    }, [store]),
  });

  return activeNonSystemObjectMetadataItems.map((objectMetadataItem) => {
    if (!objectMetadataItem.shortcut) {
      return null;
    }

    return (
      <GoToHotkeyItemEffect
        key={`go-to-hokey-item-${objectMetadataItem.id}`}
        hotkey={objectMetadataItem.shortcut}
        pathToNavigateTo={getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: objectMetadataItem.namePlural,
        })}
      />
    );
  });
};
