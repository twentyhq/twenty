import { OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/ObjectRecordOperationBrowserEventName';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordBoardDataChangedEffect } from '@/object-record/record-board/components/RecordBoardDataChangedEffect';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

const triggerRecordBoardInitialQueryMock = jest.fn();

jest.mock(
  '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery',
  () => ({
    useTriggerRecordBoardInitialQuery: () => ({
      triggerRecordBoardInitialQuery: triggerRecordBoardInitialQueryMock,
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useGetRecordBoardEffectsForUpdateInputs',
  () => ({
    useGetRecordBoardEffectsForUpdateInputs: () => ({
      getRecordBoardEffectsForUpdateInputs: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useRepositionRecordsOnBoard',
  () => ({
    useRepositionRecordsOnBoard: () => ({
      repositionRecordsOnBoard: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useRemoveRecordsFromBoard',
  () => ({
    useRemoveRecordsFromBoard: () => ({ removeRecordsFromBoard: jest.fn() }),
  }),
);

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectMetadataItem: { id: 'task-object-id' },
  }),
}));

jest.mock('@/object-metadata/utils/getFieldMetadataItemGqlFieldName', () => ({
  getFieldMetadataItemGqlFieldName: () => 'status',
}));

const INSTANCE_ID = 'board-view';
const GROUP_ID = 'todo';

const renderBoardDataChangedEffect = ({
  columnHasMoreRecords,
}: {
  columnHasMoreRecords: boolean;
}) => {
  const store = createStore();

  store.set(
    recordIndexGroupFieldMetadataItemComponentState.atomFamily({
      instanceId: INSTANCE_ID,
    }),
    { name: 'status' } as FieldMetadataItem,
  );
  store.set(
    recordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
    [GROUP_ID],
  );
  store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_ID), {
    id: GROUP_ID,
    type: RecordGroupDefinitionType.Value,
    title: 'To do',
    value: 'TODO',
    color: 'gray',
    position: 0,
    isVisible: true,
  });
  store.set(
    recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
      instanceId: INSTANCE_ID,
      familyKey: GROUP_ID,
    }),
    ['existing-task'],
  );
  store.set(recordStoreFamilyState.atomFamily('existing-task'), {
    id: 'existing-task',
    position: 1,
    __typename: 'Task',
  } satisfies ObjectRecord);
  store.set(
    recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
      instanceId: INSTANCE_ID,
      familyKey: GROUP_ID,
    }),
    columnHasMoreRecords,
  );

  render(
    <JotaiProvider store={store}>
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <RecordBoardComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <RecordBoardDataChangedEffect />
        </RecordBoardComponentInstanceContext.Provider>
      </ViewComponentInstanceContext.Provider>
    </JotaiProvider>,
  );
};

const announceCreatedTask = (position: number | 'first') => {
  act(() => {
    window.dispatchEvent(
      new CustomEvent(OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME, {
        detail: {
          objectMetadataItem: { id: 'task-object-id' },
          operation: {
            type: 'create-one',
            createdRecord: {
              id: 'new-task',
              status: 'TODO',
              position,
            },
          },
        },
      }),
    );
  });
};

describe('RecordBoardDataChangedEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refetches a fully loaded column when a new task is appended', () => {
    renderBoardDataChangedEffect({ columnHasMoreRecords: false });

    announceCreatedTask(4);

    expect(triggerRecordBoardInitialQueryMock).toHaveBeenCalledWith({
      shouldResetScroll: false,
      recordGroupId: GROUP_ID,
    });
  });

  it('keeps the pagination optimization for a later task in a partial column', () => {
    renderBoardDataChangedEffect({ columnHasMoreRecords: true });

    announceCreatedTask(4);

    expect(triggerRecordBoardInitialQueryMock).not.toHaveBeenCalled();
  });

  it('still refetches a newly inserted first task', () => {
    renderBoardDataChangedEffect({ columnHasMoreRecords: true });

    announceCreatedTask('first');

    expect(triggerRecordBoardInitialQueryMock).toHaveBeenCalledWith({
      shouldResetScroll: false,
    });
  });
});
