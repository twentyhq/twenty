import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useOpenNewRecordTitleCell } from '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { setRecordPageActiveTabId } from '@/page-layout/utils/setRecordPageActiveTabId';
import { useOpenSidePanelArtifact } from '@/side-panel/artifacts/hooks/useOpenSidePanelArtifact';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
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
  const { openSidePanelArtifact } = useOpenSidePanelArtifact();
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
      artifactPath,
    }: {
      recordId: string;
      objectNameSingular: string;
      tab?: string;
      isNewRecord?: boolean;
      resetNavigationStack?: boolean;
      artifactPath?: string;
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

        navigate(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: recordId,
        });

        return;
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

      const objectLabelSingular = objectMetadataItem.labelSingular;

      const didOpenArtifact = openSidePanelArtifact({
        artifactPath:
          artifactPath ??
          getAppPath(AppPath.RecordShowPage, {
            objectNameSingular,
            objectRecordId: recordId,
          }),
        pageTitle: isNewRecord ? t`New ${objectLabelSingular}` : undefined,
        resetNavigationStack,
      });

      if (!didOpenArtifact) {
        return;
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
    },
    [
      closeSidePanelMenu,
      isMobile,
      navigate,
      openSidePanelArtifact,
      openNewRecordTitleCell,
      runWorkflowRunOpeningInSidePanelEffects,
      store,
    ],
  );

  return {
    openRecordInSidePanel,
  };
};
