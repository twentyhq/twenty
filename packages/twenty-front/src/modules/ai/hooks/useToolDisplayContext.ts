import { useMemo } from 'react';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { type ToolDisplayContext } from '@/ai/types/tool-display-context.type';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ToolCategory } from 'twenty-shared/ai';

const EMPTY_TOOL_DISPLAY_CONTEXT: ToolDisplayContext = {
  labelByName: new Map(),
  indexByName: new Map(),
  objectMetadataItems: [],
};

export const useToolDisplayContext = (): ToolDisplayContext => {
  const { toolIndex } = useGetToolIndex();
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(() => {
    if (toolIndex.length === 0 && objectMetadataItems.length === 0) {
      return EMPTY_TOOL_DISPLAY_CONTEXT;
    }

    return {
      labelByName: new Map(toolIndex.map((entry) => [entry.name, entry.label])),
      indexByName: new Map(
        toolIndex.map((entry) => [
          entry.name,
          {
            category: entry.category as ToolCategory,
            objectName: entry.objectName,
          },
        ]),
      ),
      objectMetadataItems,
    };
  }, [toolIndex, objectMetadataItems]);
};
