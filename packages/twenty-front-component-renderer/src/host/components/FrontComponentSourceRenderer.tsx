import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { useMemo } from 'react';
import {
  type FrontComponentSelectedObjectMetadata,
  type GetObjectMetadataFunction,
} from 'twenty-sdk/front-component';

import { createMockSdkClientSources } from '@/host/component-source/utils/createMockSdkClientSources';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API } from '@/host/thread/constants/FrontComponentPreviewHostCommunicationApi';

type FrontComponentSourceRendererProps = {
  componentId: string;
  componentSource: string;
  sharedDependenciesSource?: string;
  mockQueryResult: Record<string, unknown>;
  getObjectMetadata?: GetObjectMetadataFunction;
  selectedRecordIds?: string[];
  selectedObjectMetadata?: FrontComponentSelectedObjectMetadata | null;
  colorScheme: 'light' | 'dark';
  queryMetadata?: FrontComponentHostCommunicationApi['queryMetadata'];
  onReady?: () => void;
  onError: (error?: Error) => void;
};

const EMPTY_SELECTED_RECORD_IDS: string[] = [];

export const FrontComponentSourceRenderer = ({
  componentId,
  componentSource,
  sharedDependenciesSource,
  mockQueryResult,
  getObjectMetadata,
  selectedRecordIds = EMPTY_SELECTED_RECORD_IDS,
  selectedObjectMetadata = null,
  colorScheme,
  queryMetadata,
  onReady,
  onError,
}: FrontComponentSourceRendererProps) => {
  const sdkClientSources = useMemo(
    () => createMockSdkClientSources(mockQueryResult),
    [mockQueryResult],
  );
  const hostCommunicationApi = useMemo(
    () => ({
      ...FRONT_COMPONENT_PREVIEW_HOST_COMMUNICATION_API,
      queryMetadata,
      getObjectMetadata,
    }),
    [queryMetadata, getObjectMetadata],
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
      frontComponentHostCommunicationApi={hostCommunicationApi}
      colorScheme={colorScheme}
      onReady={onReady}
      onError={onError}
    />
  );
};
