import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import { useCallback } from 'react';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  coreWorkflowVersionId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
  () => {
    const apolloCoreClient = useApolloCoreClient();

    const enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
      useCallback(
        async ({
          headlessEngineCommandContextApi,
          coreWorkflowVersionId,
          availabilityType,
          availabilityObjectMetadataId,
        }: EnrichParams): Promise<HeadlessCommandContextApi | undefined> => {
          const { data } = await apolloCoreClient.query({
            query: GetCoreWorkflowVersionDocument,
            variables: { coreWorkflowVersionId },
            fetchPolicy: 'network-only',
          });
          const version = data?.coreWorkflowVersion;

          if (!isDefined(version) || !isDefined(version.coreWorkflowId)) {
            return undefined;
          }

          return {
            ...headlessEngineCommandContextApi,
            workflowId: version.coreWorkflowId,
            workflowVersionId: version.id,
            coreWorkflowId: version.coreWorkflowId,
            coreWorkflowVersionId: version.id,
            trigger: version.trigger ?? null,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [apolloCoreClient],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
