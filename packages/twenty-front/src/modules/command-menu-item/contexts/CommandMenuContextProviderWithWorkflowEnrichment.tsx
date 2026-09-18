import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useWorkflowsWithCurrentVersions';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';

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
  const isCore = useIsWorkflowCoreEnabled();
  const workflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    isCore ? [] : selectedWorkflowRecordIds,
  );
  const {
    workflows: coreWorkflowsWithCurrentVersions,
    loading: areCoreWorkflowsLoading,
    error: coreWorkflowsError,
  } = useCoreWorkflowsWithCurrentVersions(
    isCore ? selectedWorkflowRecordIds : [],
  );

  const workflows = isCore
    ? coreWorkflowsWithCurrentVersions
    : workflowsWithCurrentVersions;

  if (
    isCore &&
    areCoreWorkflowsLoading &&
    coreWorkflowsWithCurrentVersions.length === 0
  ) {
    return null;
  }

  const enrichedSelectedRecords = commandMenuContextApi.selectedRecords.map(
    (record) => {
      const workflowWithCurrentVersion = workflows.find(
        (workflow) => workflow.id === record.id,
      );

      if (!isDefined(workflowWithCurrentVersion)) {
        return record;
      }

      return {
        ...record,
        currentVersion: workflowWithCurrentVersion.currentVersion,
        versions: workflowWithCurrentVersion.versions,
        statuses: workflowWithCurrentVersion.statuses,
        lastPublishedVersionId:
          workflowWithCurrentVersion.lastPublishedVersionId,
      };
    },
  );

  return (
    <>
      <ToastOnQueryErrorEffect
        error={isCore ? coreWorkflowsError : undefined}
        message={t`Could not load workflow actions`}
      />
      <CommandMenuContextProviderContent
        displayType={displayType}
        containerType={containerType}
        commandMenuContextApi={{
          ...commandMenuContextApi,
          selectedRecords: enrichedSelectedRecords,
        }}
        isInPreviewMode={isInPreviewMode}
      >
        {children}
      </CommandMenuContextProviderContent>
    </>
  );
};
