import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCurrentCommandMenuContextApi } from '@/command-menu-item/hooks/useCurrentCommandMenuContextApi';

import { CommandMenuContextProviderContent } from './CommandMenuContextProviderContent';
import { CommandMenuContextProviderWithWorkflowEnrichment } from './CommandMenuContextProviderWithWorkflowEnrichment';

type CommandMenuContextProviderProps = {
  isInSidePanel: boolean;
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
  isInPreviewMode?: boolean;
};

export const CommandMenuContextProvider = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
  isInPreviewMode = false,
}: CommandMenuContextProviderProps) => {
  const commandMenuContextApiFromHook = useCurrentCommandMenuContextApi();

  const commandMenuContextApi = isInSidePanel
    ? { ...commandMenuContextApiFromHook, isInSidePanel: true }
    : commandMenuContextApiFromHook;

  const currentObjectNameSingular =
    commandMenuContextApi.objectMetadataItem.nameSingular;

  const isWorkflow =
    currentObjectNameSingular === CoreObjectNameSingular.Workflow;

  const selectedWorkflowRecordIds = isWorkflow
    ? commandMenuContextApi.selectedRecords
        .map((record) => record.id)
        .filter(isDefined)
    : [];

  if (selectedWorkflowRecordIds.length > 0) {
    return (
      <CommandMenuContextProviderWithWorkflowEnrichment
        displayType={displayType}
        containerType={containerType}
        commandMenuContextApi={commandMenuContextApi}
        selectedWorkflowRecordIds={selectedWorkflowRecordIds}
        isInPreviewMode={isInPreviewMode}
      >
        {children}
      </CommandMenuContextProviderWithWorkflowEnrichment>
    );
  }

  return (
    <CommandMenuContextProviderContent
      displayType={displayType}
      containerType={containerType}
      commandMenuContextApi={commandMenuContextApi}
      isInPreviewMode={isInPreviewMode}
    >
      {children}
    </CommandMenuContextProviderContent>
  );
};
