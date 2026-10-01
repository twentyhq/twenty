import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { getVerticalListFlatPageLayoutWidgetsInOrder } from 'src/engine/core-modules/application/application-manifest/utils/get-vertical-list-flat-page-layout-widgets-in-order.util';

const buildVerticalListWidget = (
  universalIdentifier: string,
  index: number,
) => ({
  universalIdentifier,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST as const,
    index,
  },
});

describe('getVerticalListFlatPageLayoutWidgetsInOrder', () => {
  it('should sort the widgets by index when the indices are exactly 0 to n - 1', () => {
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        buildVerticalListWidget('third', 2),
        buildVerticalListWidget('first', 0),
        buildVerticalListWidget('second', 1),
      ])?.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['first', 'second', 'third']);
  });

  it('should return undefined when the indices have a gap, do not start at 0 or repeat', () => {
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        buildVerticalListWidget('first', 0),
        buildVerticalListWidget('third', 2),
      ]),
    ).toBeUndefined();
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        buildVerticalListWidget('second', 1),
      ]),
    ).toBeUndefined();
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        buildVerticalListWidget('first', 0),
        buildVerticalListWidget('also-first', 0),
      ]),
    ).toBeUndefined();
  });

  it('should return undefined when a widget is not positioned in a vertical list', () => {
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        buildVerticalListWidget('first', 0),
        {
          universalIdentifier: 'grid',
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID as const,
            row: 0,
            column: 0,
            rowSpan: 2,
            columnSpan: 2,
          },
        },
      ]),
    ).toBeUndefined();
    expect(
      getVerticalListFlatPageLayoutWidgetsInOrder([
        { universalIdentifier: 'unpositioned', position: null },
      ]),
    ).toBeUndefined();
  });

  it('should return an empty list for a tab without widgets', () => {
    expect(getVerticalListFlatPageLayoutWidgetsInOrder([])).toEqual([]);
  });
});
