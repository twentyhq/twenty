import { isGridPosition } from '@/page-layout/utils/isGridPosition';
import {
  type PageLayoutWidgetPosition,
  PageLayoutTabLayoutMode,
} from '~/generated-metadata/graphql';

describe('isGridPosition', () => {
  it('should return true for GRID layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    };

    expect(isGridPosition(position)).toBe(true);
  });

  it('should return false for CANVAS layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetCanvasPosition',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    } as PageLayoutWidgetPosition;

    expect(isGridPosition(position)).toBe(false);
  });

  it('should return false for VERTICAL_LIST layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetVerticalListPosition',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    };

    expect(isGridPosition(position)).toBe(false);
  });
});
