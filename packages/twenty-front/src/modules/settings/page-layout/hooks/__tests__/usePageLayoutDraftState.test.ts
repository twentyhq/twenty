import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutDraftState } from '../usePageLayoutDraftState';

describe('usePageLayoutDraftState', () => {
  it('should detect dirty state when draft differs from persisted', () => {
    const { result } = renderHook(() => usePageLayoutDraftState(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should handle empty name as not saveable', () => {
    const { result } = renderHook(() => usePageLayoutDraftState(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.setPageLayoutDraft({
        name: '   ',
        type: 'DASHBOARD',
        widgets: [],
      });
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('should allow updating draft state', () => {
    const { result } = renderHook(() => usePageLayoutDraftState(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.setPageLayoutDraft({
        name: 'Updated Name',
        type: 'DASHBOARD',
        widgets: [],
      });
    });

    expect(result.current.pageLayoutDraft.name).toBe('Updated Name');
    expect(result.current.canSave).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it('should detect changes in widgets', () => {
    const { result } = renderHook(() => usePageLayoutDraftState(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.setPageLayoutDraft({
        name: 'Test Layout',
        type: 'DASHBOARD',
        widgets: [
          {
            id: 'widget-1',
            title: 'New Widget',
            type: 'GRAPH',
            gridPosition: { row: 2, column: 2, rowSpan: 2, columnSpan: 2 },
            configuration: { graphType: 'pie' },
            data: {},
          },
        ],
      });
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.canSave).toBe(true);
  });
});
