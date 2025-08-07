import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useUpsertRecordFilterGroup', () => {
  it('should add a new record filter group', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

        return { upsertRecordFilterGroup, currentRecordFilterGroups };
      },
      {
        wrapper: Wrapper,
      },
    );

    const mockRecordFilterGroup: RecordFilterGroup = {
      id: 'record-filter-group-1',
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId: null,
    };

    act(() => {
      result.current.upsertRecordFilterGroup(mockRecordFilterGroup);
    });

    expect(result.current.currentRecordFilterGroups).toHaveLength(1);
    expect(result.current.currentRecordFilterGroups[0]).toEqual(
      mockRecordFilterGroup,
    );
  });

  it('should update an existing record filter group', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

        return { upsertRecordFilterGroup, currentRecordFilterGroups };
      },
      {
        wrapper: Wrapper,
      },
    );

    const mockInitialRecordFilterGroup: RecordFilterGroup = {
      id: 'record-filter-group-1',
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
      parentRecordFilterGroupId: null,
    };

    const mockUpdatedRecordFilterGroup: RecordFilterGroup = {
      id: 'record-filter-group-1',
      logicalOperator: RecordFilterGroupLogicalOperator.OR,
      parentRecordFilterGroupId: null,
    };

    act(() => {
      result.current.upsertRecordFilterGroup(mockInitialRecordFilterGroup);
    });

    expect(result.current.currentRecordFilterGroups).toHaveLength(1);
    expect(result.current.currentRecordFilterGroups[0]).toEqual(
      mockInitialRecordFilterGroup,
    );

    act(() => {
      result.current.upsertRecordFilterGroup(mockUpdatedRecordFilterGroup);
    });

    expect(result.current.currentRecordFilterGroups).toHaveLength(1);
    expect(result.current.currentRecordFilterGroups[0]).toEqual(
      mockUpdatedRecordFilterGroup,
    );
  });
});
