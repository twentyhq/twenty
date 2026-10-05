import { isThirdPartyApplication } from '@/applications/utils/isThirdPartyApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workflowsWithCurrentVersions = useWorkflowsWithCurrentVersions(
    isCore ? [] : selectedWorkflowRecordIds,
  );
  const coreWorkflowsWithCurrentVersions = useCoreWorkflowsWithCurrentVersions(
    isCore ? selectedWorkflowRecordIds : [],
  );

  const workflows = isCore
    ? coreWorkflowsWithCurrentVersions
    : workflowsWithCurrentVersions;

  const applicationManagedWorkflowIds = new Set(
    coreWorkflowsWithCurrentVersions
      .filter((workflow) =>
        isThirdPartyApplication({
          application: currentWorkspace?.installedApplications.find(
            (installedApplication) =>
              installedApplication.id === workflow.applicationId,
          ),
          currentWorkspace,
        }),
      )
      .map((workflow) => workflow.id),
  );

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
        ...(applicationManagedWorkflowIds.has(record.id) && {
          recordPermissions: {
            ...record.recordPermissions,
            canUpdate: false,
            canSoftDelete: false,
            canDelete: false,
          },
        }),
      };
    },
  );

  return (
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
  );
};
