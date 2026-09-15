import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isNonEmptyString } from '@sniptt/guards';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';

import { CommandMenuContextProviderContent } from './CommandMenuContextProviderContent';

type CommandMenuContextProviderWithWorkflowEnrichmentProps = {
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
  commandMenuContextApi: CommandMenuContextApi;
  selectedWorkflowRecordIds: string[];
  isInPreviewMode: boolean;
};

export const CommandMenuContextProviderWithWorkflowEnrichment = ({
  displayType,
  containerType,
  children,
  commandMenuContextApi,
  selectedWorkflowRecordIds,
  isInPreviewMode,
}: CommandMenuContextProviderWithWorkflowEnrichmentProps) => {
  const selectedCoreWorkflowIds = commandMenuContextApi.selectedRecords
    .filter((record) => selectedWorkflowRecordIds.includes(record.id))
    .map((record) => record.coreWorkflowId)
    .filter(isNonEmptyString);

  const isCorePointerAvailableForEveryWorkflow =
    selectedCoreWorkflowIds.length === selectedWorkflowRecordIds.length;

  const {
    workflows: coreWorkflowsWithCurrentVersions,
    isCoreEnrichmentLoading,
    isCoreEnrichmentComplete,
  } = useCoreWorkflowsWithCurrentVersions(
    isCorePointerAvailableForEveryWorkflow ? selectedCoreWorkflowIds : [],
  );

  const shouldFallBackToWorkspaceWorkflows =
    !isCorePointerAvailableForEveryWorkflow ||
    (!isCoreEnrichmentLoading && !isCoreEnrichmentComplete);

  const workspaceWorkflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    shouldFallBackToWorkspaceWorkflows ? selectedWorkflowRecordIds : [],
  );

  const workflowsWithCurrentVersions = shouldFallBackToWorkspaceWorkflows
    ? workspaceWorkflowsWithCurrentVersions
    : coreWorkflowsWithCurrentVersions;

  const enrichedSelectedRecords = commandMenuContextApi.selectedRecords.map(
    (record) => {
      const workflowWithCurrentVersion = workflowsWithCurrentVersions.find(
        (workflow) =>
          workflow.id ===
          (shouldFallBackToWorkspaceWorkflows
            ? record.id
            : record.coreWorkflowId),
      );

      if (!isDefined(workflowWithCurrentVersion)) {
        return record;
      }

      return {
        ...record,
        currentVersion: workflowWithCurrentVersion.currentVersion,
        statuses: workflowWithCurrentVersion.statuses,
        lastPublishedVersionId:
          workflowWithCurrentVersion.lastPublishedVersionId,
      };
    },
  );

  const enrichedCommandMenuContextApi = {
    ...commandMenuContextApi,
    selectedRecords: enrichedSelectedRecords,
  };

  return (
    <CommandMenuContextProviderContent
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={enrichedCommandMenuContextApi}
      isInPreviewMode={isInPreviewMode}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
};
