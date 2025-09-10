import { GraphType, WidgetType } from '@/page-layout/mocks/mockWidgets';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { PageLayoutType } from '~/generated/graphql';
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
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [],
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
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [],
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
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-1',
            title: 'Tab 1',
            position: 0,
            pageLayoutId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            widgets: [
              {
                id: 'widget-1',
                pageLayoutTabId: 'tab-1',
                title: 'New Widget',
                type: WidgetType.GRAPH,
                gridPosition: { row: 2, column: 2, rowSpan: 2, columnSpan: 2 },
                configuration: { graphType: GraphType.BAR },
                data: {},
                objectMetadataId: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
              },
            ],
          },
        ],
      });
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.canSave).toBe(true);
  });
});
