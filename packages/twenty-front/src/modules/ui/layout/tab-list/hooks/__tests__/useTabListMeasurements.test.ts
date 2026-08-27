import { useTabListMeasurements } from '@/ui/layout/tab-list/hooks/useTabListMeasurements';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { act, renderHook } from '@testing-library/react';

const VISIBLE_TABS = [
  { id: 'first-tab', title: 'First tab' },
  { id: 'second-tab', title: 'Second tab' },
];

const renderMeasuredTabList = ({
  rightPadding = 0,
  hasAddButton = false,
  containerWidth = 212,
  visibleTabs = VISIBLE_TABS,
}: {
  rightPadding?: number;
  hasAddButton?: boolean;
  containerWidth?: number;
  visibleTabs?: SingleTabProps[];
} = {}) => {
  const hook = renderHook(
    ({ rightPadding, visibleTabs }) =>
      useTabListMeasurements({
        visibleTabs,
        hasAddButton,
        rightPadding,
      }),
    { initialProps: { rightPadding, visibleTabs } },
  );

  act(() => {
    for (const tab of visibleTabs) {
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

    rerender({ rightPadding: 8, visibleTabs: VISIBLE_TABS });

    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1]]);

    rerender({ rightPadding: 0, visibleTabs: VISIBLE_TABS });

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

  it('should hide every tab when the first one cannot fit next to the more button', () => {
    const { result } = renderMeasuredTabList({ containerWidth: 181 });

    expect(result.current.visibleTabCount).toBe(0);
    expect(result.current.hiddenTabs).toEqual(VISIBLE_TABS);
    expect(result.current.hiddenTabsCount).toBe(2);
    expect(result.current.hasHiddenTabs).toBe(true);
  });

  it('should hide every tab rather than clip one when the container is very narrow', () => {
    const { result } = renderMeasuredTabList({ containerWidth: 40 });

    expect(result.current.visibleTabCount).toBe(0);
    expect(result.current.hiddenTabs).toEqual(VISIBLE_TABS);
  });

  it('should hide every tab when the new-tab button and right padding leave no room', () => {
    const { result } = renderMeasuredTabList({
      rightPadding: 8,
      hasAddButton: true,
      containerWidth: 200,
    });

    expect(result.current.visibleTabCount).toBe(0);
    expect(result.current.hiddenTabs).toEqual(VISIBLE_TABS);
  });

  it('should bring tabs back one by one as the container widens again', () => {
    const { result } = renderMeasuredTabList({ containerWidth: 40 });

    expect(result.current.visibleTabCount).toBe(0);

    act(() =>
      result.current.onContainerWidthChange({ width: 182, height: 48 }),
    );

    expect(result.current.visibleTabCount).toBe(1);
    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1]]);

    act(() =>
      result.current.onContainerWidthChange({ width: 212, height: 48 }),
    );

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should recover from an empty row when the new-tab button goes away', () => {
    const { result } = renderMeasuredTabList({
      rightPadding: 8,
      hasAddButton: true,
      containerWidth: 200,
    });

    expect(result.current.visibleTabCount).toBe(0);

    act(() =>
      result.current.onContainerWidthChange({ width: 304, height: 48 }),
    );

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should not overflow the row while a newly added tab is unmeasured', () => {
    const addedTab = { id: 'added-tab', title: 'Added tab' };
    const { result, rerender } = renderMeasuredTabList();

    rerender({
      rightPadding: 0,
      visibleTabs: [addedTab, ...VISIBLE_TABS],
    });

    expect(result.current.visibleTabCount).toBe(1);

    act(() =>
      result.current.onTabWidthChange(addedTab.id)({ width: 100, height: 48 }),
    );

    expect(result.current.visibleTabCount).toBe(1);
    expect(result.current.hiddenTabs).toEqual(VISIBLE_TABS);
  });

  it('should show every tab until the first measurement lands', () => {
    const { result } = renderHook(() =>
      useTabListMeasurements({ visibleTabs: VISIBLE_TABS }),
    );

    act(() => result.current.onContainerWidthChange({ width: 40, height: 48 }));

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });

  it('should bring a tab back when another one is removed without a remeasure', () => {
    const thirdTab = { id: 'third-tab', title: 'Third tab' };
    const { result, rerender } = renderMeasuredTabList({
      visibleTabs: [...VISIBLE_TABS, thirdTab],
    });

    expect(result.current.visibleTabCount).toBe(1);
    expect(result.current.hiddenTabs).toEqual([VISIBLE_TABS[1], thirdTab]);

    rerender({ rightPadding: 0, visibleTabs: VISIBLE_TABS });

    expect(result.current.visibleTabCount).toBe(2);
    expect(result.current.hiddenTabs).toEqual([]);
  });
});
