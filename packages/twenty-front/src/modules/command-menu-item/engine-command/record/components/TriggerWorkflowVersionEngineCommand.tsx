import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { buildTriggerWorkflowVersionPayloads } from '@/command-menu-item/engine-command/utils/buildTriggerWorkflowVersionPayloads';
import { isHeadlessTriggerWorkflowVersionCommandContextApi } from '@/command-menu-item/engine-command/utils/isHeadlessTriggerWorkflowVersionCommandContextApi';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const TriggerWorkflowVersionEngineCommand = () => {
  const mountedCommandState = useHeadlessCommandContextApi();
  const store = useStore();

  if (!isHeadlessTriggerWorkflowVersionCommandContextApi(mountedCommandState)) {
    throw new Error(
      'TriggerWorkflowVersionEngineCommand requires a workflow trigger context',
    );
  }

  const noMatchFilter: RecordGqlOperationFilter = { id: { in: [] } };

  const { fetchAllRecords } = useLazyFetchAllRecords({
    objectNameSingular:
      mountedCommandState.objectMetadataItem?.nameSingular ??
      CoreObjectNameSingular.Person,
    filter: mountedCommandState.graphqlFilter ?? noMatchFilter,
    limit: DEFAULT_QUERY_PAGE_SIZE,
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const execute = useCallback(async () => {
    let selectedRecords: ObjectRecord[];

    if (mountedCommandState.targetedRecordsRule.mode === 'selection') {
      selectedRecords = mountedCommandState.selectedRecords;
    } else {
      selectedRecords = await fetchAllRecords();
    }

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

    const payloads = buildTriggerWorkflowVersionPayloads({
      trigger: mountedCommandState.trigger,
      availabilityType: mountedCommandState.availabilityType,
      availabilityObjectMetadataId:
        mountedCommandState.availabilityObjectMetadataId,
      objectMetadataItems,
      selectedRecords,
    });

    if (!isNonEmptyArray(payloads)) {
      await runWorkflowVersion({
        workflowId: mountedCommandState.workflowId,
        workflowVersionId: mountedCommandState.workflowVersionId,
      });

      return;
    }

    for (const payload of payloads) {
      await runWorkflowVersion({
        workflowId: mountedCommandState.workflowId,
        workflowVersionId: mountedCommandState.workflowVersionId,
        payload,
      });
    }
  }, [mountedCommandState, fetchAllRecords, runWorkflowVersion, store]);

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
