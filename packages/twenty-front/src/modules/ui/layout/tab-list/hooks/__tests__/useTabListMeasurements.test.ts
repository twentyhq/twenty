import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { act, renderHook } from '@testing-library/react';

const VISIBLE_TABS = [
  { id: 'first-tab', title: 'First tab' },
  { id: 'second-tab', title: 'Second tab' },
];

const renderMeasuredTabList = ({
  rightPadding = 0,
  hasAddButton = false,
  containerWidth = 212,
} = {}) => {
  const hook = renderHook(
    ({ rightPadding }) =>
      useTabListMeasurements({
        visibleTabs: VISIBLE_TABS,
        hasAddButton,
        rightPadding,
      }),
    { initialProps: { rightPadding } },
  );

  act(() => {
    for (const tab of VISIBLE_TABS) {
      hook.result.current.onTabWidthChange(tab.id)({ width: 100, height: 48 });
    }
    hook.result.current.onMoreButtonWidthChange({ width: 70, height: 48 });
    hook.result.current.onAddButtonWidthChange({ width: 80, height: 48 });
    hook.result.current.onContainerWidthChange({
      width: containerWidth,
      height: 48,
    });
  });

  return hook;
};

describe('useTabListMeasurements', () => {
  it('should keep both tabs visible when a standalone tab list fits exactly', () => {
    const { result } = renderMeasuredTabList();

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should move the last tab into overflow when right padding takes its space', () => {
    const { result } = renderMeasuredTabList({ rightPadding: 8 });

    expect(result.current.visibleTabCount).toBe(1);
    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1]]);
  });

  it('should restore the last tab when the padded container grows enough', () => {
    const { result } = renderMeasuredTabList({ rightPadding: 8 });

    act(() =>
      result.current.onContainerWidthChange({ width: 220, height: 48 }),
    );

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should update overflow when padding changes without a container resize', () => {
    const { result, rerender } = renderMeasuredTabList();

    rerender({ rightPadding: 8 });

    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1]]);

    rerender({ rightPadding: 0 });

    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should reserve right padding together with the new-tab button', () => {
    const { result } = renderMeasuredTabList({
      rightPadding: 8,
      hasAddButton: true,
      containerWidth: 296,
    });

    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1]]);

    act(() =>
      result.current.onContainerWidthChange({ width: 304, height: 48 }),
    );

    expect(result.current.hiddenTabs).toEqual([]);
  });
});
