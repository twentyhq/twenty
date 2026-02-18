import { GoToHotkeyItemEffect } from '@/app/effect-components/GoToHotkeyItemEffect';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedStateV2 } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedStateV2';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilCallback } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath } from 'twenty-shared/utils';

export const GotoHotkeysEffectsProvider = () => {
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  useGoToHotkeys({
    key: 's',
    location: getSettingsPath(SettingsPath.ProfilePage),
    preNavigateFunction: useRecoilCallback(
      ({ set }) =>
        () => {
          set(isNavigationDrawerExpandedState, true);
          jotaiStore.set(navigationDrawerExpandedMemorizedStateV2.atom, true);
        },
      [],
    ),
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
