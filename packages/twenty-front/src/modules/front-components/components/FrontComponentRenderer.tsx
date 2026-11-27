import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { type ReactNode } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentRendererLoader } from '@/front-components/components/FrontComponentRendererLoader';
import { FindOneFrontComponentDocument } from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
  commandMenuItemId?: string;
  selectedRecordIds?: string[];
  selectedRecordsFilter?: RecordGqlOperationFilter | null;
  objectNameSingular?: string;
  timelineActivityId?: string;
  toolCall?: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
  errorFallback?: ReactNode;
  shouldPreventPageZoom?: boolean;
};

export const FrontComponentRenderer = ({
  frontComponentId,
  commandMenuItemId,
  selectedRecordIds,
  selectedRecordsFilter,
  objectNameSingular,
  timelineActivityId,
  toolCall,
  onToolCallArgumentsChange,
  loadingFallback,
  unavailableFallback,
  errorFallback,
  shouldPreventPageZoom,
}: FrontComponentRendererProps) => {
  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const storedFrontComponent = useAtomStateValue(frontComponentsSelector).find(
    (frontComponent) => frontComponent.id === frontComponentId,
  );

  const fetchedFrontComponent =
    loading || isDefined(error)
      ? undefined
      : (data?.frontComponent ?? undefined);

  const isUnavailable = !loading && !isDefined(fetchedFrontComponent);

  const loadableFrontComponent = fetchedFrontComponent ?? storedFrontComponent;

  return (
    <>
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {!isUnavailable && !isDefined(loadableFrontComponent) && loadingFallback}
      {isUnavailable && unavailableFallback}
      {!isUnavailable && isDefined(loadableFrontComponent) && (
        <FrontComponentRendererLoader
          key={loadableFrontComponent.id}
          loadableFrontComponent={loadableFrontComponent}
          fetchedFrontComponent={fetchedFrontComponent}
          commandMenuItemId={commandMenuItemId}
          selectedRecordIds={selectedRecordIds}
          selectedRecordsFilter={selectedRecordsFilter}
          objectNameSingular={objectNameSingular}
          timelineActivityId={timelineActivityId}
          toolCall={toolCall}
          onToolCallArgumentsChange={onToolCallArgumentsChange}
          loadingFallback={loadingFallback}
          unavailableFallback={unavailableFallback}
          errorFallback={errorFallback}
          shouldPreventPageZoom={shouldPreventPageZoom}
        />
      )}
    </>
  );
};
