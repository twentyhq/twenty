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
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';

type WorkflowVersionRecord = Pick<
  WorkflowVersion,
  'id' | 'workflowId' | 'trigger' | '__typename'
>;

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  workflowVersionId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
  () => {
    const apolloCoreClient = useApolloCoreClient();
    const isWorkflowVersionInCoreEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
    );

    const { findOneRecord: findOneWorkflowVersion } =
      useLazyFindOneRecord<WorkflowVersionRecord>({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        recordGqlFields: { id: true, workflowId: true, trigger: true },
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
          availabilityType,
          availabilityObjectMetadataId,
        }: EnrichParams): Promise<HeadlessCommandContextApi | undefined> => {
          const workflowVersion = await fetchWorkflowVersion(workflowVersionId);

          if (!isDefined(workflowVersion)) {
            return undefined;
          }

          const trigger = isWorkflowVersionInCoreEnabled
            ? await fetchTriggerFromCore(workflowVersionId)
            : workflowVersion.trigger;

          return {
            ...headlessEngineCommandContextApi,
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            trigger,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [
          fetchWorkflowVersion,
          fetchTriggerFromCore,
          isWorkflowVersionInCoreEnabled,
        ],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
