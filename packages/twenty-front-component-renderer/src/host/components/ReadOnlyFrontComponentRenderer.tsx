import { useMemo } from 'react';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';

type ReadOnlyFrontComponentRendererProps = {
  componentId: string;
  componentSource: string;
  sharedDependenciesSource?: string;
  data: Record<string, unknown>;
  colorScheme: 'light' | 'dark';
  onReady?: () => void;
  onError: (error?: Error) => void;
};

export const ReadOnlyFrontComponentRenderer = ({
  componentId,
  componentSource,
  sharedDependenciesSource,
  data,
  colorScheme,
  onReady,
  onError,
}: ReadOnlyFrontComponentRendererProps) => {
  const executionContext = useMemo(
    () => ({
      frontComponentId: componentId,
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      timelineActivityId: null,
      colorScheme,
    }),
    [componentId, colorScheme],
  );

  return (
    <FrontComponentRenderer
      componentUrl={`about:blank#${componentId}`}
      componentSource={componentSource}
      sharedDependenciesSource={sharedDependenciesSource}
      readOnlyData={data}
      executionContext={executionContext}
      frontComponentHostCommunicationApi={
        FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP
      }
      colorScheme={colorScheme}
      onReady={onReady}
      onError={onError}
    />
  );
};
