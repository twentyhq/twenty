import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';

const VISIBLE_TABS = [
  { id: 'first-tab', title: 'First tab' },
  { id: 'second-tab', title: 'Second tab' },
];

const MEASUREMENTS = {
  visibleTabs: VISIBLE_TABS,
  tabWidthsById: { 'first-tab': 100, 'second-tab': 100 },
  moreButtonWidth: 70,
};

describe('calculateVisibleTabCount', () => {
  it.each([
    {
      description: 'fits both standalone tabs exactly',
      containerWidth: 212,
      rightPadding: 0,
      addButtonWidth: 0,
      expected: 2,
    },
    {
      description: 'reserves identifier-bar right padding',
      containerWidth: 212,
      rightPadding: 8,
      addButtonWidth: 0,
      expected: 1,
    },
    {
      description: 'fits both tabs with right padding',
      containerWidth: 220,
      rightPadding: 8,
      addButtonWidth: 0,
      expected: 2,
    },
    {
      description: 'reserves the add button and right padding',
      containerWidth: 296,
      rightPadding: 8,
      addButtonWidth: 80,
      expected: 1,
    },
    {
      description: 'fits both tabs beside the add button',
      containerWidth: 304,
      rightPadding: 8,
      addButtonWidth: 80,
      expected: 2,
    },
    {
      description: 'overflows all tabs when the first cannot fit beside More',
      containerWidth: 181,
      rightPadding: 0,
      addButtonWidth: 0,
      expected: 0,
    },
    {
      description: 'fits the first tab and More exactly',
      containerWidth: 182,
      rightPadding: 0,
      addButtonWidth: 0,
      expected: 1,
    },
    {
      description: 'overflows all tabs in a very narrow row',
      containerWidth: 40,
      rightPadding: 0,
      addButtonWidth: 0,
      expected: 0,
    },
    {
      description: 'overflows all tabs when the add button takes their space',
      containerWidth: 200,
      rightPadding: 8,
      addButtonWidth: 80,
      expected: 0,
    },
    {
      description: 'keeps tabs visible until the container is measured',
      containerWidth: 0,
      rightPadding: 0,
      addButtonWidth: 0,
      expected: 2,
    },
  ])(
    '$description',
    ({ containerWidth, rightPadding, addButtonWidth, expected }) => {
      expect(
        calculateVisibleTabCount({
          ...MEASUREMENTS,
          containerWidth,
          rightPadding,
          addButtonWidth,
        }),
      ).toBe(expected);
    },
  );

  it('keeps tabs visible until a tab is measured', () => {
    expect(
      calculateVisibleTabCount({
        ...MEASUREMENTS,
        tabWidthsById: {},
        containerWidth: 40,
      }),
    ).toBe(2);
  });

  it('uses the widest known tab for a newly added unmeasured tab', () => {
    expect(
      calculateVisibleTabCount({
        ...MEASUREMENTS,
        visibleTabs: [{ id: 'added-tab', title: 'Added tab' }, ...VISIBLE_TABS],
        containerWidth: 212,
      }),
    ).toBe(1);
  });

  it('returns no visible tabs for an empty list', () => {
    expect(
      calculateVisibleTabCount({
        ...MEASUREMENTS,
        visibleTabs: [],
        containerWidth: 212,
      }),
    ).toBe(0);
  });
});
