import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { ViewType } from '@/views/types/ViewType';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'record-index-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecordSelectionComponentInstanceContext.Provider value={{ instanceId }}>
      {children}
    </RecordSelectionComponentInstanceContext.Provider>
  </JotaiProvider>
);

const getSelectedRecordIds = () =>
  jotaiStore.get(
    selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
  );

const renderToggleRecordSelection = () =>
  renderHook(() => useToggleRecordSelection(instanceId), { wrapper: Wrapper })
    .result;

describe('useToggleRecordSelection', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['a', 'b', 'c', 'd', 'e'],
    );
  });

  it('should toggle a record', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    expect(getSelectedRecordIds()).toEqual(['b']);

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    expect(getSelectedRecordIds()).toEqual([]);
  });

  it('should select from the anchor and replace the previous range', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'c' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'e',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['c', 'd', 'e']);

    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'a',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['a', 'b', 'c']);
  });

  it('should keep records selected outside of the range', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'a' }));
    act(() => result.current.toggleRecordSelection({ recordId: 'c' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'e',
        shouldSelectRange: true,
      }),
    );

    expect(getSelectedRecordIds()).toEqual(['a', 'c', 'd', 'e']);
  });

  it('should toggle the record when there is no anchor', () => {
    const result = renderToggleRecordSelection();

    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'd',
        shouldSelectRange: true,
      }),
    );

    expect(getSelectedRecordIds()).toEqual(['d']);
  });

  it('should keep records selected before a range when the range shrinks', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    act(() => result.current.toggleRecordSelection({ recordId: 'd' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'a',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['a', 'b', 'c', 'd']);

    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'c',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['b', 'c', 'd']);
  });

  it('should follow the order groups are shown in and skip hidden groups', () => {
    jotaiStore.set(
      recordIndexViewTypeState.atomFamily({ instanceId }),
      ViewType.KANBAN,
    );
    jotaiStore.set(recordGroupIdsComponentState.atomFamily({ instanceId }), [
      'hidden-group',
      'second-group',
      'first-group',
    ]);
    for (const [recordGroupId, position, isVisible, recordIds] of [
      ['first-group', 0, true, ['a', 'b']],
      ['second-group', 1, true, ['c', 'd']],
      ['hidden-group', 2, false, ['e']],
    ] as const) {
      jotaiStore.set(
        recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
        {
          id: recordGroupId,
          position,
          isVisible,
          title: recordGroupId,
        } as RecordGroupDefinition,
      );
      jotaiStore.set(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey: recordGroupId,
        }),
        [...recordIds],
      );
    }
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'd',
        shouldSelectRange: true,
      }),
    );

    expect(
      ['a', 'b', 'c', 'd', 'e'].filter((recordId) =>
        jotaiStore.get(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId,
            familyKey: recordId,
          }),
        ),
      ),
    ).toEqual(['b', 'c', 'd']);
  });
});
