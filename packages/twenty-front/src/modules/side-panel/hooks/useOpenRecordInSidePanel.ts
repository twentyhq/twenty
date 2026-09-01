import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
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
      if (isMobile) {
        // Mobile escapes the panel router and cannot hand its hash to the main
        // navigator, so seed the main tab as a compatibility transition.
        if (isDefined(tab)) {
          setRecordPageActiveTabId({
            recordId,
            objectNameSingular,
            tabId: tab,
            store,
          });
        }

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
      const currentRoutedLocation = currentNavigationStackItem?.routedLocation;
      const recordPath = getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });
      const recordPathWithTab = isDefined(tab)
        ? `${recordPath}#${encodeURIComponent(tab)}`
        : recordPath;

      if (
        isDefined(currentNavigationStackItem) &&
        currentRoutedLocation?.pathname === recordPath
      ) {
        if (isDefined(tab)) {
          openRoutedPageInSidePanel({
            path: recordPathWithTab,
            pageTitle: currentNavigationStackItem.pageTitle,
            replaceCurrent: true,
          });
        }

        return currentNavigationStackItem.pageId;
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
        path: recordPathWithTab,
        pageTitle: isNewRecord
          ? t`New ${objectMetadataItem.labelSingular}`
          : undefined,
        resetNavigationStack,
      });

      if (!isDefined(pageComponentInstanceId)) {
        return null;
      }

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
