import { describe, expect, it } from 'vitest';

import { definePageLayout } from '@/sdk/define';

const makePageLayoutConfig = (
  headerCommandMenuItemUniversalIdentifiers?: string[],
) => ({
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'Post card record page',
  type: 'RECORD_PAGE' as const,
  tabs: [
    {
      universalIdentifier: '22222222-2222-4222-8222-222222222222',
      title: 'Preview',
      position: 0,
      widgets: [
        {
          universalIdentifier: '33333333-3333-4333-8333-333333333333',
          title: 'Post card preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT' as const,
            frontComponentUniversalIdentifier:
              '44444444-4444-4444-8444-444444444444',
            headerCommandMenuItemUniversalIdentifiers,
          },
        },
      ],
    },
  ],
});

describe('definePageLayout', () => {
  it('accepts widget header command menu item references', () => {
    const result = definePageLayout(
      makePageLayoutConfig([
        '55555555-5555-4555-8555-555555555555',
        '66666666-6666-4666-8666-666666666666',
      ]),
    );

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects invalid and duplicate widget header command menu item references', () => {
    const result = definePageLayout(
      makePageLayoutConfig([
        'not-a-uuid',
        '55555555-5555-4555-8555-555555555555',
        '55555555-5555-4555-8555-555555555555',
      ]),
    );

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'PageLayoutWidget header command menu item universalIdentifier "not-a-uuid" must be a UUID',
    );
    expect(result.errors).toContain(
      'PageLayoutWidget header command menu item universalIdentifiers must be unique',
    );
  });
});
