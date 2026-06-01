import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { FIND_MANY_APPLICATIONS_FOR_TOOL_TABLE } from '~/pages/settings/ai/graphql/queries/findManyApplicationsForToolTable';
import { FIND_MANY_MARKETPLACE_APPS_FOR_TOOL_TABLE } from '~/pages/settings/ai/graphql/queries/findManyMarketplaceAppsForToolTable';
import { type SettingsAgentToolApplication } from '~/pages/settings/ai/types/SettingsAgentToolApplication';
import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { type SettingsAgentToolMarketplaceApp } from '~/pages/settings/ai/types/SettingsAgentToolMarketplaceApp';

export const useSettingsAgentToolsTable = () => {
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const {
    toolIndex,
    loading: toolIndexLoading,
    error: toolIndexError,
  } = useGetToolIndex();

  const { data: applicationsData } = useQuery<{
    findManyApplications: SettingsAgentToolApplication[];
  }>(FIND_MANY_APPLICATIONS_FOR_TOOL_TABLE);

  const { data: marketplaceAppsData } = useQuery<{
    findManyMarketplaceApps: SettingsAgentToolMarketplaceApp[];
  }>(FIND_MANY_MARKETPLACE_APPS_FOR_TOOL_TABLE);

  const allTools: SettingsAgentToolItem[] = useMemo(
    () => [
      ...logicFunctions
        .filter((fn) => isDefined(fn.toolTriggerSettings))
        .map((fn) => ({
          identifier: fn.id,
          name: fn.name,
          description: fn.description,
          applicationId: fn.applicationId,
        })),
      ...toolIndex
        .filter((tool) => tool.category !== ToolCategory.LOGIC_FUNCTION)
        .map((tool) => ({
          identifier: tool.name,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          objectName: tool.objectName,
          icon: tool.icon,
        })),
    ],
    [logicFunctions, toolIndex],
  );

  const applicationById = new Map(
    (applicationsData?.findManyApplications ?? []).map((application) => [
      application.id,
      application,
    ]),
  );

  // MarketplaceApp.id IS the universal identifier — see
  // marketplace-query.service.ts where `id: registration.universalIdentifier`.
  const marketplaceAppByUniversalIdentifier = new Map(
    (marketplaceAppsData?.findManyMarketplaceApps ?? []).map(
      (marketplaceApp) => [marketplaceApp.id, marketplaceApp],
    ),
  );

  const isLoading = toolIndexLoading && !toolIndexError;

  return {
    allTools,
    applicationById,
    marketplaceAppByUniversalIdentifier,
    currentWorkspace,
    isLoading,
  };
};
