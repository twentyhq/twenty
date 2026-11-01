import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { recordCreationFormSettingsObjectMetadataIdComponentState } from '@/side-panel/pages/record-creation-form-settings/states/recordCreationFormSettingsObjectMetadataIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenRecordCreationFormSettingsInSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openRecordCreationFormSettingsInSidePanel = useCallback(
    (
      objectMetadataItem: Pick<
        EnrichedObjectMetadataItem,
        'id' | 'labelSingular'
      >,
    ) => {
      const pageId = v4();

      store.set(
        recordCreationFormSettingsObjectMetadataIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        objectMetadataItem.id,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.RecordCreationFormSettings,
        pageTitle: t`Create ${objectMetadataItem.labelSingular}`,
        pageIcon: IconPlus,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, t],
  );

  return { openRecordCreationFormSettingsInSidePanel };
};
