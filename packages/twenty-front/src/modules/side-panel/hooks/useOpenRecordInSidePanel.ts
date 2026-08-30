import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useOpenNewRecordTitleCell } from '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { setRecordPageActiveTabId } from '@/page-layout/utils/setRecordPageActiveTabId';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';

import { useRunWorkflowRunOpeningInSidePanelEffects } from '@/workflow/hooks/useRunWorkflowRunOpeningInSidePanelEffects';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useOpenRecordInSidePanel = () => {
  const store = useStore();

  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const { runWorkflowRunOpeningInSidePanelEffects } =
    useRunWorkflowRunOpeningInSidePanelEffects();
  const { openNewRecordTitleCell } = useOpenNewRecordTitleCell();

  const isMobile = useIsMobile();
  const navigate = useNavigateApp();

  const openRecordInSidePanel = useCallback(
    ({
      recordId,
      objectNameSingular,
      tab,
      isNewRecord = false,
      resetNavigationStack = false,
    }: {
      recordId: string;
      objectNameSingular: string;
      tab?: string;
      isNewRecord?: boolean;
      resetNavigationStack?: boolean;
    }) => {
      if (isDefined(tab)) {
        setRecordPageActiveTabId({
          recordId,
          objectNameSingular,
          tabId: tab,
          store,
        });
      }

      if (isMobile) {
        const objectMetadataItemForRecordPage = store.get(
          objectMetadataItemFamilySelector.selectorFamily({
            objectName: objectNameSingular,
            objectNameType: 'singular',
          }),
        );

        const labelIdentifierField = isDefined(objectMetadataItemForRecordPage)
          ? getLabelIdentifierFieldMetadataItem(objectMetadataItemForRecordPage)
          : undefined;

        if (isNewRecord && isDefined(labelIdentifierField)) {
          store.set(newRecordTitleCellToOpenState.atom, {
            recordId,
            fieldName: labelIdentifierField.name,
          });
        }

        closeSidePanelMenu();

        // Deliberately the main outlet: on mobile the panel is the viewport, so
        // hosting the record on the right would be the thing being escaped.
        navigate(
          AppPath.RecordShowPage,
          {
            objectNameSingular,
            objectRecordId: recordId,
          },
          undefined,
          { surface: 'main' },
        );

        return null;
      }

      const navigationStack = store.get(sidePanelNavigationStackState.atom);

      const currentNavigationStackItem = navigationStack.at(-1);

      if (isDefined(currentNavigationStackItem)) {
        const currentPath = store.get(
          sidePanelRoutedPagePathComponentState.atomFamily({
            instanceId: currentNavigationStackItem.pageId,
          }),
        );

        const currentRecordShowParams = isDefined(currentPath)
          ? getRecordShowParamsFromPath(currentPath)
          : null;

        if (currentRecordShowParams?.objectRecordId === recordId) {
          return currentNavigationStackItem.pageId;
        }
      }

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

      const pageComponentInstanceId = openRoutedPageInSidePanel({
        path: getAppPath(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: recordId,
        }),
        pageTitle: isNewRecord
          ? t`New ${objectMetadataItem.labelSingular}`
          : undefined,
        resetNavigationStack,
      });

      if (!isDefined(pageComponentInstanceId)) {
        return null;
      }

      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      const newMorphItemsMap = new Map(currentMorphItems);
      newMorphItemsMap.set(pageComponentInstanceId, [
        {
          objectMetadataId: objectMetadataItem.id,
          recordId,
        },
      ]);

      store.set(
        sidePanelNavigationMorphItemsByPageState.atom,
        newMorphItemsMap,
      );

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

      // The panel page owns its own context store, so a caller with state to
      // hand the record needs to know which instance will read it.
      return pageComponentInstanceId;
    },
    [
      closeSidePanelMenu,
      isMobile,
      navigate,
      openNewRecordTitleCell,
      openRoutedPageInSidePanel,
      runWorkflowRunOpeningInSidePanelEffects,
      store,
    ],
  );

  return {
    openRecordInSidePanel,
  };
};
