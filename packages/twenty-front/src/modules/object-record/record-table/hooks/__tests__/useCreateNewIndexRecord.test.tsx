import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { type OnRecordCreated } from '@/object-record/types/OnRecordCreated';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/object-record/hooks/useCreateNewRecord', () => ({
  useCreateNewRecord: ({
    onRecordCreated,
  }: {
    onRecordCreated: OnRecordCreated;
  }) => ({
    createNewRecord: (recordInput: { position?: string }) =>
      onRecordCreated({
        record: { id: 'new-task', status: 'TODO', __typename: 'Task' },
        recordInput,
      }),
  }),
}));

jest.mock(
  '@/object-record/record-table/hooks/useBuildRecordInputFromFilters',
  () => ({
    useBuildRecordInputFromFilters: () => ({
      buildRecordInputFromFilters: () => ({}),
    }),
  }),
);

const INSTANCE_ID = 'task-table';
const GROUP_ID = 'todo-group';
const taskMetadata = getMockObjectMetadataItemOrThrow('task');

describe('useCreateNewIndexRecord', () => {
  it.each([
    {
      position: 'first',
      existingIds: ['existing-task'],
      expectedIds: ['new-task', 'existing-task'],
    },
    {
      position: 'last',
      existingIds: ['existing-task'],
      expectedIds: ['existing-task', 'new-task'],
    },
    {
      position: 'first',
      existingIds: ['existing-task', 'new-task'],
      expectedIds: ['new-task', 'existing-task'],
    },
    {
      position: 'last',
      existingIds: ['new-task', 'existing-task'],
      expectedIds: ['existing-task', 'new-task'],
    },
  ])(
    'inserts once at $position with initial rows $existingIds',
    async ({ position, existingIds, expectedIds }) => {
      const store = createStore();
      const recordIdsAtom =
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId: INSTANCE_ID,
          familyKey: GROUP_ID,
        });

      store.set(recordIdsAtom, existingIds);
      store.set(
        recordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
        [GROUP_ID],
      );
      store.set(recordGroupDefinitionFamilyState.atomFamily(GROUP_ID), {
        id: GROUP_ID,
        type: RecordGroupDefinitionType.Value,
        title: 'To do',
        value: 'TODO',
        color: 'blue',
        position: 0,
        isVisible: true,
      });
      store.set(
        recordIndexGroupFieldMetadataItemComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
        taskMetadata.fields.find((field) => field.name === 'status'),
      );

      const Wrapper = ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      );

      const { result } = renderHook(
        () =>
          useCreateNewIndexRecord({
            objectMetadataItem: taskMetadata,
            instanceId: INSTANCE_ID,
          }),
        { wrapper: Wrapper },
      );

      await act(async () => {
        await result.current.createNewIndexRecord({ position });
      });

      expect(store.get(recordIdsAtom)).toEqual(expectedIds);
    },
  );
});
