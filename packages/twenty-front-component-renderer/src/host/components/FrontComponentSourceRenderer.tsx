import { useMemo } from 'react';
import { type FrontComponentSelectedObjectMetadata } from 'twenty-sdk/front-component';

import { createMockSdkClientSources } from '@/host/component-source/utils/createMockSdkClientSources';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { FRONT_COMPONENT_HOST_COMMUNICATION_API_NOOP } from '@/host/thread/constants/FrontComponentHostCommunicationApiNoop';

type FrontComponentSourceRendererProps = {
  componentId: string;
  componentSource: string;
  sharedDependenciesSource?: string;
  mockQueryResult: Record<string, unknown>;
  selectedRecordIds?: string[];
  selectedObjectMetadata?: FrontComponentSelectedObjectMetadata | null;
  colorScheme: 'light' | 'dark';
  onReady?: () => void;
  onError: (error?: Error) => void;
};

const EMPTY_SELECTED_RECORD_IDS: string[] = [];

export const FrontComponentSourceRenderer = ({
  componentId,
  componentSource,
  sharedDependenciesSource,
  mockQueryResult,
  selectedRecordIds = EMPTY_SELECTED_RECORD_IDS,
  selectedObjectMetadata = null,
  colorScheme,
  onReady,
  onError,
}: FrontComponentSourceRendererProps) => {
  const sdkClientSources = useMemo(
    () => createMockSdkClientSources(mockQueryResult),
    [mockQueryResult],
  );
  const executionContext = useMemo(
    () => ({
      frontComponentId: componentId,
      userId: null,
      recordId: selectedRecordIds.length === 1 ? selectedRecordIds[0] : null,
      selectedRecordIds,
      selectedObjectMetadata,
      timelineActivityId: null,
      colorScheme,
    }),
    [componentId, colorScheme, selectedRecordIds, selectedObjectMetadata],
  );

  return (
    <FrontComponentRenderer
      componentUrl={`about:blank#${componentId}`}
      componentSource={componentSource}
      sharedDependenciesSource={sharedDependenciesSource}
      sdkClientSources={sdkClientSources}
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
