import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import {
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionLegacyMappingDocument,
} from '~/generated/graphql';
import { useCallback } from 'react';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';
import { type WorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type WorkflowVersionRecord = Pick<
  WorkflowVersion,
  'id' | 'workflowId' | '__typename'
>;

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  workflowVersionId?: string;
  coreWorkflowVersionId?: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
  () => {
    const isCore = useIsWorkflowCoreEnabled();
    const apolloCoreClient = useApolloCoreClient();
    const { findOneRecord: findOneWorkflowVersion } =
      useLazyFindOneRecord<WorkflowVersionRecord>({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        recordGqlFields: { id: true, workflowId: true },
      });

    const fetchTriggerFromCore = useCallback(
      async (versionId: string) => {
        const { data } = await apolloCoreClient.query<{
          workflowVersionContent: WorkflowVersionContent;
        }>({
          query: GET_WORKFLOW_VERSION_CONTENT,
          variables: { workflowVersionId: versionId },
        });

        return data?.workflowVersionContent.trigger ?? null;
      },
      [apolloCoreClient],
    );

    const fetchWorkflowVersion = useCallback(
      async (versionId: string): Promise<WorkflowVersionRecord | undefined> => {
        let record: WorkflowVersionRecord | undefined;

        await findOneWorkflowVersion({
          objectRecordId: versionId,
          onCompleted: (data) => {
            record = data;
          },
        });

        return record;
      },
      [findOneWorkflowVersion],
    );

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
          let resolvedWorkspaceVersionId = workflowVersionId;

          if (
            isCore &&
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

          if (
            isDefined(resolvedCoreVersionId) &&
            (isCore || !isDefined(resolvedWorkspaceVersionId))
          ) {
            const { data } = await apolloCoreClient.query({
              query: GetCoreWorkflowVersionDocument,
              variables: { coreWorkflowVersionId: resolvedCoreVersionId },
              fetchPolicy: 'network-only',
            });
            const version = data?.coreWorkflowVersion;
            if (!isDefined(version)) {
              return undefined;
            }
            if (isCore) {
              if (!isDefined(version.coreWorkflowId)) {
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
            }
            resolvedWorkspaceVersionId =
              version.workspaceWorkflowVersionId ?? undefined;
          }

          if (isCore || !isDefined(resolvedWorkspaceVersionId)) {
            return undefined;
          }
          const workflowVersion = await fetchWorkflowVersion(
            resolvedWorkspaceVersionId,
          );

          if (!isDefined(workflowVersion)) {
            return undefined;
          }

          const trigger = await fetchTriggerFromCore(
            resolvedWorkspaceVersionId,
          );

          return {
            ...headlessEngineCommandContextApi,
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            trigger,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [fetchWorkflowVersion, fetchTriggerFromCore, apolloCoreClient, isCore],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
