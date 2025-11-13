import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { useRunWorkflowRunOpeningInCommandMenuSideEffects } from '@/workflow/hooks/useRunWorkflowRunOpeningInCommandMenuSideEffects';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordInCommandMenu = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { navigateCommandMenu } = useCommandMenu();
  const { runWorkflowRunOpeningInCommandMenuSideEffects } =
    useRunWorkflowRunOpeningInCommandMenuSideEffects();

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set, snapshot }) => {
      return ({
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
        const navigationStack = getSnapshotValue(
          snapshot,
          commandMenuNavigationStackState,
        );

        const currentNavigationStackItem = navigationStack.at(-1);

        if (isDefined(currentNavigationStackItem)) {
          const currentRecordId = getSnapshotValue(
            snapshot,
            viewableRecordIdComponentState.atomFamily({
              instanceId: currentNavigationStackItem.pageId,
            }),
          );

          if (currentRecordId === recordId) {
            return;
          }
        }

        const pageComponentInstanceId = v4();

        set(
          viewableRecordNameSingularComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectNameSingular,
        );
        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          recordId,
        );
        set(viewableRecordIdState, recordId);

        const objectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: objectNameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!objectMetadataItem) {
          throw new Error(
            `No object metadata item found for object name ${objectNameSingular}`,
          );
        }

        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectMetadataItem.id,
        );

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          {
            mode: 'selection',
            selectedRecordIds: [recordId],
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          1,
        );

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          ContextStoreViewType.ShowPage,
        );

        set(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          snapshot
            .getLoadable(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }),
            )
            .getValue(),
        );

        set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          snapshot
            .getLoadable(
              contextStoreIsPageInEditModeComponentState.atomFamily({
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }),
            )
            .getValue(),
        );

        const currentMorphItems = snapshot
          .getLoadable(commandMenuNavigationMorphItemsByPageState)
          .getValue();

        const morphItemToAdd = {
          objectMetadataId: objectMetadataItem.id,
          recordId,
        };

        const newMorphItemsMap = new Map(currentMorphItems);
        newMorphItemsMap.set(pageComponentInstanceId, [morphItemToAdd]);

        set(commandMenuNavigationMorphItemsByPageState, newMorphItemsMap);

        const Icon = objectMetadataItem?.icon
          ? getIcon(objectMetadataItem.icon)
          : getIcon('IconList');

        const IconColor = getIconColorForObjectType({
          objectType: objectMetadataItem.nameSingular,
          theme,
        });

        const objectLabelSingular = objectMetadataItem.labelSingular;

        navigateCommandMenu({
          page: CommandMenuPages.ViewRecord,
          pageTitle: isNewRecord
            ? t`New ${objectLabelSingular}`
            : objectLabelSingular,
          pageIcon: Icon,
          pageIconColor: IconColor,
          pageId: pageComponentInstanceId,
          resetNavigationStack,
        });

        if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
          runWorkflowRunOpeningInCommandMenuSideEffects({
            objectMetadataItem,
            recordId,
          });
        }
      };
    },
    [
      getIcon,
      navigateCommandMenu,
      runWorkflowRunOpeningInCommandMenuSideEffects,
      theme,
    ],
  );

  return {
    openRecordInCommandMenu,
  };
};
