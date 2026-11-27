import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { useOnFrontComponentUpdated } from '@/front-components/hooks/useOnFrontComponentUpdated';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { Fragment, type ReactNode } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentRendererContent } from '@/front-components/components/FrontComponentRendererContent';
import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentRendererLoadingStatesResetEffect } from '@/front-components/components/FrontComponentRendererLoadingStatesResetEffect';
import { FrontComponentSourcesPreloadEffect } from '@/front-components/components/FrontComponentSourcesPreloadEffect';
import { frontComponentApplicationTokenPairLoadErrorComponentState } from '@/front-components/states/frontComponentApplicationTokenPairLoadErrorComponentState';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { FindOneFrontComponentDocument } from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  instanceId: string;
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
  instanceId,
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
  const frontComponentInstanceId = `${instanceId}-${frontComponentId}`;

  const { data, loading, error } = useQuery(FindOneFrontComponentDocument, {
    variables: { id: frontComponentId },
  });

  useOnFrontComponentUpdated({
    frontComponentId,
  });

  const frontComponentFromMetadataStore = useAtomStateValue(
    frontComponentsSelector,
  ).find((frontComponent) => frontComponent.id === frontComponentId);

  const frontComponentInitialApplicationAccessToken =
    useAtomComponentStateValue(
      frontComponentInitialApplicationAccessTokenComponentState,
      frontComponentInstanceId,
    );
  const frontComponentApplicationTokenPairLoadError =
    useAtomComponentStateValue(
      frontComponentApplicationTokenPairLoadErrorComponentState,
      frontComponentInstanceId,
    );
  const frontComponentSourcesPreload = useAtomComponentStateValue(
    frontComponentSourcesPreloadComponentState,
    frontComponentInstanceId,
  );

  const frontComponentFromFindOneQuery =
    loading || isDefined(error)
      ? undefined
      : (data?.frontComponent ?? undefined);

  const frontComponentFieldsNeededToStartLoading =
    frontComponentFromFindOneQuery ?? frontComponentFromMetadataStore;

  const isFrontComponentNotFound =
    !loading && !isDefined(frontComponentFromFindOneQuery);

  const isFrontComponentUnavailable =
    isFrontComponentNotFound ||
    isDefined(frontComponentApplicationTokenPairLoadError);

  const isReadyToRender =
    !isFrontComponentUnavailable &&
    isDefined(frontComponentFromFindOneQuery) &&
    isDefined(frontComponentInitialApplicationAccessToken) &&
    isDefined(frontComponentSourcesPreload);

  return (
    <FrontComponentInstanceContext.Provider
      value={{ instanceId: frontComponentInstanceId }}
    >
      <FrontComponentLoadErrorToastEffect
        errorMessage={
          error?.message ?? frontComponentApplicationTokenPairLoadError?.message
        }
      />
      {!isFrontComponentNotFound &&
        isDefined(frontComponentFieldsNeededToStartLoading) && (
          <Fragment key={frontComponentInstanceId}>
            <FrontComponentRendererLoadingStatesResetEffect />
            <FrontComponentApplicationTokenPairEffect
              applicationId={
                frontComponentFieldsNeededToStartLoading.applicationId
              }
            />
            <FrontComponentSourcesPreloadEffect
              frontComponentFieldsNeededToStartLoading={
                frontComponentFieldsNeededToStartLoading
              }
            />
          </Fragment>
        )}
      {isFrontComponentUnavailable && unavailableFallback}
      {!isFrontComponentUnavailable && !isReadyToRender && loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererContent
          key={frontComponentInstanceId}
          frontComponent={frontComponentFromFindOneQuery}
          applicationAccessToken={frontComponentInitialApplicationAccessToken}
          sourcesPreload={frontComponentSourcesPreload}
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
      )}
    </FrontComponentInstanceContext.Provider>
  );
};
