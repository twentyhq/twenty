import { useMemo } from 'react';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';

export type ToolLabel = {
  label: string;
  inProgressLabel?: string;
  completedLabel?: string;
};

export const useToolLabelMap = (): Map<string, ToolLabel> => {
  const { toolIndex } = useGetToolIndex();

  return useMemo(
    () =>
      new Map(
        toolIndex.map((entry) => [
          entry.name,
          {
            label: entry.label,
            inProgressLabel: entry.inProgressLabel ?? undefined,
            completedLabel: entry.completedLabel ?? undefined,
          },
        ]),
      ),
    [toolIndex],
  );
};
