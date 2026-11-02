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
    const content = [
      '[guide](/fr/user-guide/billing/overview)',
      '<Card href="/fr/user-guide">Guide</Card>',
    ].join('\n');

    expect(localizeLinks(content, 'fr')).toBe(content);
  });

  it('localizes section root links without trailing slashes, with anchors, and with queries', () => {
    const content = [
      '<Card href="/user-guide">User Guide</Card>',
      '<Card href="/user-guide/">User Guide Slash</Card>',
      '[Developers](/developers)',
      '[Developers](/developers/)',
      'Read https://docs.twenty.com/developers for details.',
      '<Card href="/user-guide#billing">Billing</Card>',
      '[Guide](/user-guide?ref=docs)',
    ].join('\n');

    expect(localizeLinks(content, 'fr')).toBe(
      [
        '<Card href="/fr/user-guide">User Guide</Card>',
        '<Card href="/fr/user-guide/">User Guide Slash</Card>',
        '[Developers](/fr/developers)',
        '[Developers](/fr/developers/)',
        'Read https://docs.twenty.com/fr/developers for details.',
        '<Card href="/fr/user-guide#billing">Billing</Card>',
        '[Guide](/fr/user-guide?ref=docs)',
      ].join('\n'),
    );
  });

  it('leaves images and external links untouched', () => {
    const content = [
      '![Import](/images/user-guide/import.png)',
      '[Mintlify](https://mintlify.com/docs/user-guide/overview)',
      '<Card href="/user-guides">Guides</Card>',
    ].join('\n');

    expect(localizeLinks(content, 'de')).toBe(content);
  });
});
