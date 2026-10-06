import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';
import {
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionLegacyMappingDocument,
} from '~/generated/graphql';

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  workflowVersionId?: string;
  coreWorkflowVersionId?: string;
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
          workflowVersionId,
          coreWorkflowVersionId,
          availabilityType,
          availabilityObjectMetadataId,
        }: EnrichParams): Promise<HeadlessCommandContextApi | undefined> => {
          let resolvedCoreVersionId = coreWorkflowVersionId;

          if (
            !isDefined(resolvedCoreVersionId) &&
            isDefined(workflowVersionId)
          ) {
            const { data } = await apolloCoreClient.query({
              query: GetCoreWorkflowVersionLegacyMappingDocument,
              variables: { workspaceWorkflowVersionId: workflowVersionId },
              fetchPolicy: 'network-only',
            });
            resolvedCoreVersionId = data?.coreWorkflowVersion?.id;
          }

          if (!isDefined(resolvedCoreVersionId)) {
            return undefined;
          }

          const { data } = await apolloCoreClient.query({
            query: GetCoreWorkflowVersionDocument,
            variables: { coreWorkflowVersionId: resolvedCoreVersionId },
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
