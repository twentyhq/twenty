import { shouldUseSoloCanvasContentPadding } from '@/page-layout/widgets/utils/shouldUseSoloCanvasContentPadding';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

describe('shouldUseSoloCanvasContentPadding', () => {
  it('returns true for a solo widget on a CANVAS tab', () => {
    expect(
      shouldUseSoloCanvasContentPadding({
        presentation: 'solo',
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      }),
    ).toBe(true);
  });

  it('returns false for a solo widget on a VERTICAL_LIST tab', () => {
    expect(
      shouldUseSoloCanvasContentPadding({
        presentation: 'solo',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      }),
    ).toBe(false);
  });

  it('returns false for a stack presentation on a CANVAS tab', () => {
    expect(
      shouldUseSoloCanvasContentPadding({
        presentation: 'stack',
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      }),
    ).toBe(false);
  });
});
