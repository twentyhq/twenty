import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BaseWrapper>
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: 'test' }}
    >
      {children}
    </RecordFilterGroupsComponentInstanceContext.Provider>
  </BaseWrapper>
);

describe('useRemoveRecordFilterGroup', () => {
  it('should remove an existing record filter group', () => {
    const { result } = renderHook(
      () => {
        const currentRecordFilterGroups = useAtomComponentStateValue(
          currentRecordFilterGroupsComponentState,
          'test',
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
        const currentRecordFilterGroups = useAtomComponentStateValue(
          currentRecordFilterGroupsComponentState,
          'test',
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
