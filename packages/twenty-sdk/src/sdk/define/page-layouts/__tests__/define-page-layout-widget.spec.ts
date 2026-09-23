import { describe, expect, it } from 'vitest';

import {
  definePageLayoutWidget,
  PageLayoutTabLayoutMode,
  type StandalonePageLayoutWidgetManifest,
} from '@/sdk/define';

const WIDGET_CONFIG: StandalonePageLayoutWidgetManifest = {
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  pageLayoutTabUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
  title: 'Docs',
  type: 'IFRAME',
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1000 },
  configuration: {
    configurationType: 'IFRAME',
    url: 'https://example.com/docs',
  },
};

describe('definePageLayoutWidget', () => {
  it('accepts a widget with a tab and a position', () => {
    const result = definePageLayoutWidget(WIDGET_CONFIG);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a widget without a tab or a position', () => {
    const result = definePageLayoutWidget({
      ...WIDGET_CONFIG,
      pageLayoutTabUniversalIdentifier: '',
      position:
        undefined as unknown as StandalonePageLayoutWidgetManifest['position'],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      'PageLayoutWidget must have a pageLayoutTabUniversalIdentifier when defined standalone (use the universalIdentifier of the tab it is added to)',
      'PageLayoutWidget must have a position when defined standalone (its tab is not in the manifest, so the layout mode cannot be inferred)',
    ]);
  });

  it('rejects invalid header command menu item references like the other page layout definers', () => {
    const result = definePageLayoutWidget({
      ...WIDGET_CONFIG,
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          '33333333-3333-4333-8333-333333333333',
        headerCommandMenuItemUniversalIdentifiers: ['not-a-uuid'],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'PageLayoutWidget header command menu item universalIdentifier "not-a-uuid" must be a UUID',
    );
  });
});
