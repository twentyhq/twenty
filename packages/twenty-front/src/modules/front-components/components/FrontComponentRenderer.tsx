import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { type ReactNode, useId } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentRendererContent } from '@/front-components/components/FrontComponentRendererContent';
import { FrontComponentRendererPrerequisitesLoader } from '@/front-components/components/FrontComponentRendererPrerequisitesLoader';
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
  const frontComponentRendererMountId = useId();
  const frontComponentInstanceId = `${frontComponentId}-${frontComponentRendererMountId}`;

  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const frontComponentFromMetadataStore = useAtomStateValue(
    frontComponentsSelector,
  ).find((frontComponent) => frontComponent.id === frontComponentId);

  const frontComponentFromFindOneQuery =
    loading || isDefined(error)
      ? undefined
      : (data?.frontComponent ?? undefined);

  const isFrontComponentUnavailable =
    !loading && !isDefined(frontComponentFromFindOneQuery);

  const frontComponentFieldsNeededToStartLoading =
    frontComponentFromFindOneQuery ?? frontComponentFromMetadataStore;

  return (
    <>
      <FrontComponentLoadErrorToastEffect errorMessage={error?.message} />
      {!isFrontComponentUnavailable &&
        !isDefined(frontComponentFieldsNeededToStartLoading) &&
        loadingFallback}
      {isFrontComponentUnavailable && unavailableFallback}
      {!isFrontComponentUnavailable &&
        isDefined(frontComponentFieldsNeededToStartLoading) && (
          <FrontComponentInstanceContext.Provider
            value={{ instanceId: frontComponentInstanceId }}
          >
            <FrontComponentRendererPrerequisitesLoader
              key={frontComponentInstanceId}
              frontComponentFieldsNeededToStartLoading={
                frontComponentFieldsNeededToStartLoading
              }
              frontComponentFromFindOneQuery={frontComponentFromFindOneQuery}
              loadingFallback={loadingFallback}
              unavailableFallback={unavailableFallback}
            >
              <FrontComponentRendererContent
                commandMenuItemId={commandMenuItemId}
                selectedRecordIds={selectedRecordIds}
                selectedRecordsFilter={selectedRecordsFilter}
                objectNameSingular={objectNameSingular}
                timelineActivityId={timelineActivityId}
                toolCall={toolCall}
                onToolCallArgumentsChange={onToolCallArgumentsChange}
                loadingFallback={loadingFallback}
                errorFallback={errorFallback}
                shouldPreventPageZoom={shouldPreventPageZoom}
              />
            </FrontComponentRendererPrerequisitesLoader>
          </FrontComponentInstanceContext.Provider>
        )}
    </>
  );
};
