import { useCallback } from 'react';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

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
    const { findOneRecord: findOneWorkflowVersion } =
      useLazyFindOneRecord<WorkflowVersionRecord>({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        recordGqlFields: { id: true, workflowId: true, trigger: true },
      });

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

          return {
            ...headlessEngineCommandContextApi,
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            trigger: workflowVersion.trigger,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [fetchWorkflowVersion],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
