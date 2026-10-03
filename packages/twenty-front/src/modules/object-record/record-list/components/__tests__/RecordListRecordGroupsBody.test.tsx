import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { RecordListRecordGroupsBody } from '@/object-record/record-list/components/RecordListRecordGroupsBody';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

const instanceId = 'record-index-id';

let mockRecordsByGroupId: Record<string, ObjectRecord[]> = {};

jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexTableQuery',
  () => ({
    useRecordIndexTableQuery: () => {
      const { useCurrentRecordGroupId } = jest.requireActual(
        '@/object-record/record-group/hooks/useCurrentRecordGroupId',
      );

      return {
        records: mockRecordsByGroupId[useCurrentRecordGroupId()] ?? [],
        loading: false,
        hasNextPage: false,
        fetchMoreRecords: jest.fn(),
      };
    },
  }),
);

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectNameSingular: 'opportunity',
  }),
}));

jest.mock(
  '@/object-record/record-list/components/RecordListRecordGroupSection',
  () => ({
    RecordListRecordGroupSection: () => {
      const { useCurrentRecordGroupId } = jest.requireActual(
        '@/object-record/record-group/hooks/useCurrentRecordGroupId',
      );

      return <div>{`Group ${useCurrentRecordGroupId()}`}</div>;
    },
  }),
);

jest.mock('@/object-record/record-list/components/RecordListRecords', () => ({
  RecordListRecords: () => null,
}));

jest.mock(
  '@/object-record/record-index/components/RecordIndexGroupAggregatesDataLoader',
  () => ({
    RecordIndexGroupAggregatesDataLoader: () => null,
  }),
);

const getGroupsBody = () => (
  <JotaiProvider store={jotaiStore}>
    <ViewComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordListRecordGroupsBody />
    </ViewComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('RecordListRecordGroupsBody', () => {
  beforeEach(() => {
    resetJotaiStore();

    jotaiStore.set(recordGroupIdsComponentState.atomFamily({ instanceId }), [
      'new',
      'meeting',
    ]);

    for (const [recordGroupId, position] of [
      ['new', 0],
      ['meeting', 1],
    ] as const) {
      jotaiStore.set(
        recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
        {
          id: recordGroupId,
          type: RecordGroupDefinitionType.Value,
          title: recordGroupId,
          value: recordGroupId,
          color: 'transparent',
          position,
          isVisible: true,
        },
      );
    }

    jotaiStore.set(
      recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
        instanceId,
      }),
      true,
    );
  });

  it('should show a hidden empty group again once its records come back', () => {
    mockRecordsByGroupId = {
      new: [{ id: 'record-1', __typename: 'Opportunity' } as ObjectRecord],
      meeting: [{ id: 'record-2', __typename: 'Opportunity' } as ObjectRecord],
    };

    const { rerender } = render(getGroupsBody());

    expect(screen.getByText('Group new')).toBeInTheDocument();
    expect(screen.getByText('Group meeting')).toBeInTheDocument();

    mockRecordsByGroupId = {
      new: [{ id: 'record-1', __typename: 'Opportunity' } as ObjectRecord],
      meeting: [],
    };
    rerender(getGroupsBody());

    expect(screen.queryByText('Group meeting')).not.toBeInTheDocument();

    mockRecordsByGroupId = {
      new: [{ id: 'record-1', __typename: 'Opportunity' } as ObjectRecord],
      meeting: [{ id: 'record-2', __typename: 'Opportunity' } as ObjectRecord],
    };
    rerender(getGroupsBody());

    expect(screen.getByText('Group meeting')).toBeInTheDocument();
  });

  it('should show groups that start empty once their records load', () => {
    mockRecordsByGroupId = {};

    const { rerender } = render(getGroupsBody());

    expect(screen.queryByText('Group new')).not.toBeInTheDocument();

    mockRecordsByGroupId = {
      new: [{ id: 'record-1', __typename: 'Opportunity' } as ObjectRecord],
    };
    rerender(getGroupsBody());

    expect(screen.getByText('Group new')).toBeInTheDocument();
    expect(screen.queryByText('Group meeting')).not.toBeInTheDocument();
  });
});
