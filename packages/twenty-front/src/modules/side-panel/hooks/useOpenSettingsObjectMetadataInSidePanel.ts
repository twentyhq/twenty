import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableObjectMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableObjectMetadataIdComponentState';

export const useOpenSettingsObjectMetadataInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSettingsObjectMetadataInSidePanel = useCallback(
    ({ objectMetadataId }: { objectMetadataId: string }) => {
      const objectMetadataItem = store
        .get(objectMetadataItemsByIdMapSelector.atom)
        .get(objectMetadataId);

      // A chat message or an open panel can outlive the object it names, and
      // this runs from a click handler, where throwing would reach no one.
      if (!isDefined(objectMetadataItem)) {
        return;
      }

      const pageComponentInstanceId = v4();

      store.set(
        viewableObjectMetadataIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectMetadataId,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.SettingsObjectMetadata,
        pageTitle: objectMetadataItem.labelPlural,
        pageIcon: getIcon(objectMetadataItem.icon),
        pageIconColor: getIconColorForObjectType(
          objectMetadataItem.nameSingular,
        ),
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openSettingsObjectMetadataInSidePanel };
};
