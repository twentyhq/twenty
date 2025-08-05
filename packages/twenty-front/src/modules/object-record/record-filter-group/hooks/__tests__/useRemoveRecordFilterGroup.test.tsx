import { renderHook } from '@testing-library/react';

import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act } from 'react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useRemoveRecordFilterGroup } from '../useRemoveRecordFilterGroup';
import { useUpsertRecordFilterGroup } from '../useUpsertRecordFilterGroup';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useRemoveRecordFilterGroup', () => {
  it('should remove an existing record filter group', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();
        const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

        return {
          upsertRecordFilterGroup,
          removeRecordFilterGroup,
          currentRecordFilterGroups,
        };
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

    act(() => {
      result.current.removeRecordFilterGroup(mockRecordFilterGroup.id);
    });

    expect(result.current.currentRecordFilterGroups).toHaveLength(0);
  });

  it('should not modify record filter groups when trying to remove a non-existent record filter group', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilterGroups = useRecoilComponentValue(
          currentRecordFilterGroupsComponentState,
        );

        const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();
        const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

        return {
          upsertRecordFilterGroup,
          removeRecordFilterGroup,
          currentRecordFilterGroups,
        };
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

    act(() => {
      result.current.removeRecordFilterGroup(
        'non-existent-record-filter-group-id',
      );
    });

    expect(result.current.currentRecordFilterGroups).toHaveLength(1);
    expect(result.current.currentRecordFilterGroups[0]).toEqual(
      mockRecordFilterGroup,
    );
  });
});
