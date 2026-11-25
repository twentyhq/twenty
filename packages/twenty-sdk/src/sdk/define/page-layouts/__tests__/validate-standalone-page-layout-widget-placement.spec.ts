import { describe, expect, it } from 'vitest';

import { validateStandalonePageLayoutWidgetPlacement } from '@/sdk/define/page-layouts/validate-standalone-page-layout-widget-placement';

describe('validateStandalonePageLayoutWidgetPlacement', () => {
  it('accepts a widget with a tab and a position', () => {
    expect(
      validateStandalonePageLayoutWidgetPlacement({
        pageLayoutTabUniversalIdentifier:
          '22222222-2222-4222-8222-222222222222',
        position: { layoutMode: 'VERTICAL_LIST', index: 1000 },
      }),
    ).toEqual([]);
  });

  it('rejects a widget without a tab or a position', () => {
    expect(validateStandalonePageLayoutWidgetPlacement({})).toEqual([
      'PageLayoutWidget must have a pageLayoutTabUniversalIdentifier when defined standalone (use the universalIdentifier of the tab it is added to)',
      'PageLayoutWidget must have a position when defined standalone (its tab is not in the manifest, so the layout mode cannot be inferred)',
    ]);
  });
});
