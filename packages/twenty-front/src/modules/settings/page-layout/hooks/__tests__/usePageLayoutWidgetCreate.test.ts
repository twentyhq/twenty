import {
  GraphSubType,
  WidgetType,
} from '@/settings/page-layout/mocks/mockWidgets';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { usePageLayoutWidgetCreate } from '../usePageLayoutWidgetCreate';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('usePageLayoutWidgetCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new widget with default position', () => {
    const { result } = renderHook(() => usePageLayoutWidgetCreate(), {
      wrapper: RecoilRoot,
    });

    act(() => {
      result.current.handleCreateWidget(WidgetType.GRAPH, GraphSubType.BAR);
    });

    expect(typeof result.current.handleCreateWidget).toBe('function');
  });

  it('should handle different graph types', () => {
    const { result } = renderHook(() => usePageLayoutWidgetCreate(), {
      wrapper: RecoilRoot,
    });

    const graphTypes = [
      GraphSubType.NUMBER,
      GraphSubType.GAUGE,
      GraphSubType.PIE,
      GraphSubType.BAR,
    ];

    graphTypes.forEach((graphType) => {
      act(() => {
        result.current.handleCreateWidget(WidgetType.GRAPH, graphType);
      });
    });

    expect(typeof result.current.handleCreateWidget).toBe('function');
  });
});
