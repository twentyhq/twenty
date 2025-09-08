import { GoToHotkeyItemEffect } from '@/app/effect-components/GoToHotkeyItemEffect';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { useGoToHotkeys } from '@/ui/utilities/hotkey/hooks/useGoToHotkeys';
import { useRecoilCallback } from 'recoil';

export const GotoHotkeysEffectsProvider = () => {
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  useGoToHotkeys({
    key: 's',
    location: '/settings/profile',
    preNavigateFunction: useRecoilCallback(
      ({ set }) =>
        () => {
          set(isNavigationDrawerExpandedState, true);
          set(navigationDrawerExpandedMemorizedState, true);
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
        pathToNavigateTo={`/objects/${objectMetadataItem.namePlural}`}
      />
    );
  });
};
