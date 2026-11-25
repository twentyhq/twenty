import { assertPageLayoutTabHasDefinedLayoutModeOrThrow } from '@/page-layout/utils/assertPageLayoutTabHasDefinedLayoutModeOrThrow';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

describe('assertPageLayoutTabHasDefinedLayoutModeOrThrow', () => {
  it('should throw when tab is undefined', () => {
    expect(() => {
      assertPageLayoutTabHasDefinedLayoutModeOrThrow(undefined);
    }).toThrow('Tab layout mode is not defined');
  });

  it('should throw when tab has null layoutMode', () => {
    const tab = {
      layoutMode: null,
    };

    expect(() => {
      assertPageLayoutTabHasDefinedLayoutModeOrThrow(tab);
    }).toThrow('Tab layout mode is not defined');
  });

  it('should throw when tab has undefined layoutMode', () => {
    const tab = {
      layoutMode: undefined,
    };

    expect(() => {
      assertPageLayoutTabHasDefinedLayoutModeOrThrow(tab);
    }).toThrow('Tab layout mode is not defined');
  });

  it('should not throw when tab has a valid layoutMode', () => {
    const tab = {
      layoutMode: PageLayoutTabLayoutMode.GRID,
    };

    expect(() => {
      assertPageLayoutTabHasDefinedLayoutModeOrThrow(tab);
    }).not.toThrow();
  });

  it('should not throw for VERTICAL_LIST layoutMode', () => {
    const tab = {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    };

    expect(() => {
      assertPageLayoutTabHasDefinedLayoutModeOrThrow(tab);
    }).not.toThrow();
  });
});
