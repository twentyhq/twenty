import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useEndRecordDrag } from '@/object-record/record-drag/hooks/useEndRecordDrag';
import { useStartRecordDrag } from '@/object-record/record-drag/hooks/useStartRecordDrag';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
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

const getDraggedRecordIds = () =>
  jotaiStore.get(draggedRecordIdsComponentState.atomFamily({ instanceId }));

const isDraggingRecord = () =>
  jotaiStore.get(isDraggingRecordComponentState.atomFamily({ instanceId }));

const isSecondaryDragged = (recordId: string) =>
  jotaiStore.get(
    isRecordIdSecondaryDragMultipleComponentFamilyState.atomFamily({
      instanceId,
      familyKey: { recordId },
    }),
  );

const renderDragHooks = () =>
  renderHook(
    () => ({
      ...useStartRecordDrag(),
      ...useEndRecordDrag(),
    }),
    { wrapper: Wrapper },
  );

describe('useStartRecordDrag and useEndRecordDrag', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should drag only the dragged record when it is not selected', () => {
    const { result } = renderDragHooks();

    act(() => {
      result.current.startRecordDrag('record-1', ['record-2', 'record-3']);
    });

    expect(isDraggingRecord()).toBe(true);
    expect(getDraggedRecordIds()).toEqual(['record-1']);
    expect(isSecondaryDragged('record-2')).toBe(false);
  });

  it('should drag the whole selection when the dragged record is selected', () => {
    const { result } = renderDragHooks();

    act(() => {
      result.current.startRecordDrag('record-2', [
        'record-1',
        'record-2',
        'record-3',
      ]);
    });

    expect(getDraggedRecordIds()).toEqual(['record-1', 'record-2', 'record-3']);
    expect(isSecondaryDragged('record-1')).toBe(true);
    expect(isSecondaryDragged('record-2')).toBe(false);
    expect(isSecondaryDragged('record-3')).toBe(true);
  });

  it('should clear the drag state when the drag ends', () => {
    const { result } = renderDragHooks();

    act(() => {
      result.current.startRecordDrag('record-2', ['record-1', 'record-2']);
    });
    act(() => {
      result.current.endRecordDrag();
    });

    expect(isDraggingRecord()).toBe(false);
    expect(getDraggedRecordIds()).toEqual([]);
    expect(isSecondaryDragged('record-1')).toBe(false);
  });
});
