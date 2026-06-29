import { useMemo } from 'react';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';

export const useSettingsAgentToolsTable = () => {
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const {
    toolIndex,
    loading: toolIndexLoading,
    error: toolIndexError,
  } = useGetToolIndex();

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
          label: tool.label,
          description: tool.description,
          category: tool.category,
          objectName: tool.objectName,
          icon: tool.icon,
        })),
    ],
    [logicFunctions, toolIndex],
  );

  const isLoading = toolIndexLoading && !toolIndexError;

  return {
    allTools,
    currentWorkspace,
    isLoading,
  };
};
