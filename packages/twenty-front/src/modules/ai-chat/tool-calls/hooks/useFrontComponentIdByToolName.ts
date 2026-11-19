import { useMemo } from 'react';

import { isToolWidgetName } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';

const EMPTY_FRONT_COMPONENT_IDS: Map<string, string> = new Map();

export const useFrontComponentIdByToolName = (): Map<string, string> => {
  const { toolIndex } = useGetToolIndex();

  return useMemo(() => {
    if (toolIndex.length === 0) {
      return EMPTY_FRONT_COMPONENT_IDS;
    }

    const frontComponentIdByToolName = new Map<string, string>();

    for (const entry of toolIndex) {
      // Built-in widgets render inside the step group, so they win over an app component.
      if (isDefined(entry.widgetName) && isToolWidgetName(entry.widgetName)) {
        continue;
      }

      if (isDefined(entry.frontComponentId)) {
        frontComponentIdByToolName.set(entry.name, entry.frontComponentId);
      }
    }

    return frontComponentIdByToolName;
  }, [toolIndex]);
};
