import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { flowState } from '@/workflow/states/flowState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { useSetInitialWorkflowRunRightDrawerTab } from '@/workflow/workflow-diagram/hooks/useSetInitialWorkflowRunRightDrawerTab';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordInCommandMenu = () => {
  const apolloClient = useApolloClient();
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { navigateCommandMenu } = useCommandMenu();
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { setInitialWorkflowRunRightDrawerTab } =
    useSetInitialWorkflowRunRightDrawerTab();

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set, snapshot }) => {
      return ({
        recordId,
        objectNameSingular,
        isNewRecord = false,
      }: {
        recordId: string;
        objectNameSingular: string;
        isNewRecord?: boolean;
      }) => {
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

        const currentMorphItems = snapshot
          .getLoadable(commandMenuNavigationMorphItemByPageState)
          .getValue();

        const morphItemToAdd = {
          objectMetadataId: objectMetadataItem.id,
          recordId,
        };

        const newMorphItems = new Map(currentMorphItems);
        newMorphItems.set(pageComponentInstanceId, morphItemToAdd);

        set(commandMenuNavigationMorphItemByPageState, newMorphItems);

        const Icon = objectMetadataItem?.icon
          ? getIcon(objectMetadataItem.icon)
          : getIcon('IconList');

        const IconColor = getIconColorForObjectType({
          objectType: objectMetadataItem.nameSingular,
          theme,
        });

        const capitalizedObjectNameSingular = capitalize(objectNameSingular);

        navigateCommandMenu({
          page: CommandMenuPages.ViewRecord,
          pageTitle: isNewRecord
            ? t`New ${capitalizedObjectNameSingular}`
            : capitalizedObjectNameSingular,
          pageIcon: Icon,
          pageIconColor: IconColor,
          pageId: pageComponentInstanceId,
          resetNavigationStack: false,
        });

        if (objectNameSingular === CoreObjectNameSingular.WorkflowRun) {
          const objectMetadataItems = getSnapshotValue(
            snapshot,
            objectMetadataItemsState,
          );

          const workflowRunRecord = getRecordFromCache<WorkflowRun>({
            objectMetadataItem,
            cache: apolloClient.cache,
            recordId,
            objectMetadataItems,
          });
          if (
            !(
              isDefined(workflowRunRecord) &&
              isDefined(workflowRunRecord.output)
            )
          ) {
            throw new Error(
              `No workflow run record found for record ID ${recordId}`,
            );
          }

          const { stepToOpenByDefault } = generateWorkflowRunDiagram({
            steps: workflowRunRecord.output.flow.steps,
            stepsOutput: workflowRunRecord.output.stepsOutput,
            trigger: workflowRunRecord.output.flow.trigger,
          });

          if (!isDefined(stepToOpenByDefault)) {
            return;
          }

          set(workflowRunIdState, workflowRunRecord.id);
          set(workflowIdState, workflowRunRecord.workflowId);
          set(flowState, {
            workflowVersionId: workflowRunRecord.workflowVersionId,
            trigger: workflowRunRecord.output.flow.trigger,
            steps: workflowRunRecord.output.flow.steps,
          });
          set(workflowSelectedNodeState, stepToOpenByDefault.id);

          openWorkflowRunViewStepInCommandMenu(
            workflowRunRecord.workflowId,
            stepToOpenByDefault.data.name,
            getIcon(getWorkflowNodeIconKey(stepToOpenByDefault.data)),
          );

          setInitialWorkflowRunRightDrawerTab({
            stepExecutionStatus: stepToOpenByDefault.data.runStatus,
            workflowSelectedNode: stepToOpenByDefault.id,
          });
        }
      };
    },
    [
      apolloClient.cache,
      getIcon,
      navigateCommandMenu,
      openWorkflowRunViewStepInCommandMenu,
      setInitialWorkflowRunRightDrawerTab,
      theme,
    ],
  );

  return {
    openRecordInCommandMenu,
  };
};
