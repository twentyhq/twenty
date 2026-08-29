import { renderHook } from '@testing-library/react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const WORKFLOW_RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const workflowVersionObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('workflowVersion');
const workflowObjectMetadataItem = getMockObjectMetadataItemOrThrow('workflow');

const workflowRelationFieldMetadataItem =
  workflowVersionObjectMetadataItem.fields.find(
    (field) => field.name === 'workflow',
  );

if (!isDefined(workflowRelationFieldMetadataItem)) {
  throw new Error('Missing "workflow" field on the workflowVersion object');
}

const workflowRecordFilter: RecordFilter = {
  id: 'record-filter-1',
  fieldMetadataId: workflowRelationFieldMetadataItem.id,
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: false,
    isCurrentRecordSelected: false,
    selectedRecordIds: [WORKFLOW_RECORD_ID],
  }),
  displayValue: 'My workflow',
  type: 'RELATION',
  label: 'Workflow',
};

const renderUseQueryVariablesFromParentView = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) =>
  renderHook(() => useQueryVariablesFromParentView({ objectMetadataItem }), {
    wrapper: getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store) => {
        store.set(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          {
            parentViewComponentId: 'record-index-workflow-versions',
            parentViewObjectNameSingular:
              workflowVersionObjectMetadataItem.nameSingular,
            parentViewFilterGroups: [],
            parentViewFilters: [workflowRecordFilter],
            parentViewSorts: [],
          },
        );
      },
    }),
  });

describe('useQueryVariablesFromParentView', () => {
  it('should compute the filter when the parent view targets the same object', () => {
    const { result } = renderUseQueryVariablesFromParentView(
      workflowVersionObjectMetadataItem,
    );

    expect(result.current.filter).toEqual({
      workflowId: { in: [WORKFLOW_RECORD_ID] },
    });
  });

  it('should ignore the parent view when it targets another object', () => {
    const { result } = renderUseQueryVariablesFromParentView(
      workflowObjectMetadataItem,
    );

    expect(result.current.filter).toEqual({});
  });
});
