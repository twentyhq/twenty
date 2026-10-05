import { describe, expect, it } from 'vitest';

import { localizeLinks } from '../fix-translated-links';

describe('localizeLinks', () => {
  it('points markdown, href and absolute docs links at the page language', () => {
    const content = [
      'See [the guide](/user-guide/billing/overview).',
      '<Card href="/getting-started/quickstart">Start</Card>',
      'Read https://docs.twenty.com/developers/extend/api for details.',
    ].join('\n');

    expect(localizeLinks(content, 'fr')).toBe(
      [
        'See [the guide](/fr/user-guide/billing/overview).',
        '<Card href="/fr/getting-started/quickstart">Start</Card>',
        'Read https://docs.twenty.com/fr/developers/extend/api for details.',
      ].join('\n'),
    );
  });

  it('leaves already localized links untouched', () => {
    const content = '[guide](/fr/user-guide/billing/overview)';

    expect(localizeLinks(content, 'fr')).toBe(content);
  });

  it('leaves images and external links untouched', () => {
    const content = [
      '![Import](/images/user-guide/import.png)',
      '[Mintlify](https://mintlify.com/docs/user-guide/overview)',
    ].join('\n');

    expect(localizeLinks(content, 'de')).toBe(content);
  });
});
