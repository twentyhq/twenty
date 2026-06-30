import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import {
  type PageLayoutWidgetPosition,
  PageLayoutTabLayoutMode,
} from '~/generated-metadata/graphql';

describe('isVerticalListPosition', () => {
  it('should return true for VERTICAL_LIST layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetVerticalListPosition',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    };

    expect(isVerticalListPosition(position)).toBe(true);
  });

  it('should return false for CANVAS layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetCanvasPosition',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    } as PageLayoutWidgetPosition;

    expect(isVerticalListPosition(position)).toBe(false);
  });

  it('should return false for GRID layout mode', () => {
    const position: PageLayoutWidgetPosition = {
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
    } as PageLayoutWidgetPosition;

    expect(isVerticalListPosition(position)).toBe(false);
  });
});
