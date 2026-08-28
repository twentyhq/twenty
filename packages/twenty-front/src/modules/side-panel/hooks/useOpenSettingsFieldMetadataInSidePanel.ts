import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableFieldMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableFieldMetadataIdComponentState';

export const useOpenSettingsFieldMetadataInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSettingsFieldMetadataInSidePanel = useCallback(
    ({ fieldMetadataId }: { fieldMetadataId: string }) => {
      const fieldMetadataItem = store
        .get(fieldMetadataItemByIdMapSelector.atom)
        .get(fieldMetadataId);

      // A chat message or an open panel can outlive the field it names, and
      // this runs from a click handler, where throwing would reach no one.
      if (!isDefined(fieldMetadataItem)) {
        return;
      }

      const pageComponentInstanceId = v4();

      store.set(
        viewableFieldMetadataIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        fieldMetadataId,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SettingsFieldMetadata,
        pageTitle: fieldMetadataItem.label,
        pageIcon: getIcon(fieldMetadataItem.icon),
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openSettingsFieldMetadataInSidePanel };
};
