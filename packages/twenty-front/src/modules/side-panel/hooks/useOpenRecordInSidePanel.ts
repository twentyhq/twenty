import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { useOpenNewRecordTitleCell } from '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';

import { useRunWorkflowRunOpeningInSidePanelEffects } from '@/workflow/hooks/useRunWorkflowRunOpeningInSidePanelEffects';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();

  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { runWorkflowRunOpeningInSidePanelEffects } =
    useRunWorkflowRunOpeningInSidePanelEffects();
  const { openNewRecordTitleCell } = useOpenNewRecordTitleCell();

  const openRecordInSidePanel = useCallback(
    ({
      recordId,
      objectNameSingular,
      isNewRecord = false,
      resetNavigationStack = false,
    }: {
      recordId: string;
      objectNameSingular: string;
      isNewRecord?: boolean;
      resetNavigationStack?: boolean;
    }) => {
      const navigationStack = store.get(sidePanelNavigationStackState.atom);

      const currentNavigationStackItem = navigationStack.at(-1);

      if (isDefined(currentNavigationStackItem)) {
        const currentRecordId = store.get(
          viewableRecordIdComponentState.atomFamily({
            instanceId: currentNavigationStackItem.pageId,
          }),
        );

        if (currentRecordId === recordId) {
          return;
        }
      }

      const pageComponentInstanceId = v4();

      store.set(
        viewableRecordNameSingularComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectNameSingular,
      );
      store.set(
        viewableRecordIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        recordId,
      );
      store.set(viewableRecordIdState.atom, recordId);

      const objectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: objectNameSingular,
          objectNameType: 'singular',
        }),
      );

      if (!objectMetadataItem) {
        throw new Error(
          `No object metadata item found for object name ${objectNameSingular}`,
        );
      }

      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectMetadataItem.id,
      );

      store.set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        {
          mode: 'selection',
          selectedRecordIds: [recordId],
        },
      );

      store.set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        1,
      );

      store.set(
        contextStoreCurrentPageTypeComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        ContextStorePageType.Record,
      );

      store.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        store.get(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        ),
      );

      store.set(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        store.get(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
        ),
      );

      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      const morphItemToAdd = {
        objectMetadataId: objectMetadataItem.id,
        recordId,
      };

      const newMorphItemsMap = new Map(currentMorphItems);
      newMorphItemsMap.set(pageComponentInstanceId, [morphItemToAdd]);

      store.set(
        sidePanelNavigationMorphItemsByPageState.atom,
        newMorphItemsMap,
      );

      const Icon = objectMetadataItem?.icon
        ? getIcon(objectMetadataItem.icon)
        : getIcon('IconList');

      const IconColor = getIconColorForObjectType(
        objectMetadataItem.nameSingular,
      );

      const objectLabelSingular = objectMetadataItem.labelSingular;

      navigateSidePanelMenu({
        page: SidePanelPages.ViewRecord,
        pageTitle: isNewRecord
          ? t`New ${objectLabelSingular}`
          : objectLabelSingular,
        pageIcon: Icon,
        pageIconColor: IconColor,
        pageId: pageComponentInstanceId,
        resetNavigationStack,
      });

      if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
        runWorkflowRunOpeningInSidePanelEffects({
          objectMetadataItem,
          recordId,
        });
      }

      if (isNewRecord) {
        const labelIdentifierField =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);

        if (isDefined(labelIdentifierField)) {
          openNewRecordTitleCell({
            recordId,
            fieldName: labelIdentifierField.name,
          });
        }
      }
    },
    [
      getIcon,
      navigateSidePanelMenu,
      openNewRecordTitleCell,
      runWorkflowRunOpeningInSidePanelEffects,
      store,
    ],
  );

  return {
    openRecordInSidePanel,
  };
};
