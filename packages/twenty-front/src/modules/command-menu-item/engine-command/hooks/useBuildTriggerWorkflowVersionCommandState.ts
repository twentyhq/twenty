import { useCallback } from 'react';

import { type MountedCommandState } from '@/command-menu-item/engine-command/types/MountedCommandState';
import { buildTriggerWorkflowVersionPayloads } from '@/command-menu-item/engine-command/utils/buildTriggerWorkflowVersionPayloads';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { useStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type WorkflowVersionRecord = Pick<
  WorkflowVersion,
  'id' | 'workflowId' | 'trigger' | '__typename'
>;

type BuildTriggerWorkflowVersionCommandStateParams = {
  baseState: MountedCommandState;
  workflowVersionId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useBuildTriggerWorkflowVersionCommandState = () => {
  const store = useStore();

  const { findOneRecord: findOneWorkflowVersion } =
    useLazyFindOneRecord<WorkflowVersionRecord>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      recordGqlFields: { id: true, workflowId: true, trigger: true },
    });

  const fetchWorkflowVersion = useCallback(
    async (
      versionId: string,
    ): Promise<WorkflowVersionRecord | undefined> => {
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

  const buildTriggerWorkflowVersionCommandState = useCallback(
    async ({
      baseState,
      workflowVersionId,
      availabilityType,
      availabilityObjectMetadataId,
    }: BuildTriggerWorkflowVersionCommandStateParams): Promise<
      MountedCommandState | undefined
    > => {
      const workflowVersion = await fetchWorkflowVersion(workflowVersionId);

      if (!isDefined(workflowVersion)) {
        return undefined;
      }

      const selectedRecordIds =
        baseState.targetedRecordsRule.mode === 'selection'
          ? baseState.targetedRecordsRule.selectedRecordIds
          : [];

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const payloads = buildTriggerWorkflowVersionPayloads({
        store,
        trigger: workflowVersion.trigger,
        availabilityType,
        availabilityObjectMetadataId,
        objectMetadataItems,
        selectedRecordIds,
      });

      return {
        ...baseState,
        workflowId: workflowVersion.workflowId,
        workflowVersionId: workflowVersion.id,
        payloads,
      };
    },
    [store, fetchWorkflowVersion],
  );

  return { buildTriggerWorkflowVersionCommandState };
};
