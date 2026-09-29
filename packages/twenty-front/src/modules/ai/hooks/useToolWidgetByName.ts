import { useMemo } from 'react';

import { isToolWidgetName } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { type ToolWidget } from '@/ai/types/ToolWidget';

const EMPTY_TOOL_WIDGETS: Map<string, ToolWidget> = new Map();

// A tool names the widget that renders its calls; the chat resolves that
// pointer instead of switching on tool names it would have to know about.
export const useToolWidgetByName = (): Map<string, ToolWidget> => {
  const { toolIndex } = useGetToolIndex();

  return useMemo(() => {
    if (toolIndex.length === 0) {
      return EMPTY_TOOL_WIDGETS;
    }

    const widgetByName = new Map<string, ToolWidget>();

    for (const entry of toolIndex) {
      if (isDefined(entry.widgetName) && isToolWidgetName(entry.widgetName)) {
        widgetByName.set(entry.name, {
          kind: 'builtin',
          name: entry.widgetName,
        });
        continue;
      }

      if (isDefined(entry.frontComponentId)) {
        widgetByName.set(entry.name, {
          kind: 'front-component',
          frontComponentId: entry.frontComponentId,
        });
      }
    }

    return widgetByName;
  }, [toolIndex]);
};
