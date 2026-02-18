import { useUpdateFrontComponentApolloCache } from '@/front-components/hooks/useUpdateFrontComponentApolloCache';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import {
  AllMetadataName,
  type FrontComponent,
} from '~/generated-metadata/graphql';

type UseOnFrontComponentUpdatedArgs = {
  frontComponentId: string;
};

export const useOnFrontComponentUpdated = ({
  frontComponentId,
}: UseOnFrontComponentUpdatedArgs) => {
  const queryId = `front-component-updated-${frontComponentId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.frontComponent,
      variables: {
        filter: { id: { eq: frontComponentId } },
      },
    },
  });

  const { updateFrontComponentApolloCache } =
    useUpdateFrontComponentApolloCache({
      frontComponentId,
    });

  useListenToMetadataOperationBrowserEvent<FrontComponent>({
    metadataName: AllMetadataName.frontComponent,
    onMetadataOperationBrowserEvent: updateFrontComponentApolloCache,
  });
};
