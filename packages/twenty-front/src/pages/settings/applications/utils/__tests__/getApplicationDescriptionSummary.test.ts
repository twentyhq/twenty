import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';

describe('getApplicationDescriptionSummary', () => {
  it('returns an empty string for missing or blank descriptions', () => {
    expect(getApplicationDescriptionSummary(undefined)).toBe('');
    expect(getApplicationDescriptionSummary(null)).toBe('');
    expect(getApplicationDescriptionSummary('')).toBe('');
    expect(getApplicationDescriptionSummary('\n\n   \n\t')).toBe('');
  });

  it('keeps a plain first paragraph as is', () => {
    expect(
      getApplicationDescriptionSummary('Enrich People.\n\nMore details.'),
    ).toBe('Enrich People.');
  });

  it('strips markdown formatting from the first paragraph', () => {
    expect(
      getApplicationDescriptionSummary('**Bold** and [a link](https://x.y).'),
    ).toBe('Bold and a link.');
  });

  it('skips images, code blocks and empty blocks before the first text', () => {
    expect(
      getApplicationDescriptionSummary(
        '![cover](https://example.com/c.png)\n\n```js\nconsole.log(1)\n```\n\n# Heading only\n\n- bullet',
      ),
    ).toBe('Heading only');
  });

  it('does not use an inline image alt text as the summary', () => {
    expect(
      getApplicationDescriptionSummary(
        '![cover](https://example.com/c.png) Real text',
      ),
    ).toBe('Real text');
  });

  it('keeps the text after an image whose URL contains parentheses', () => {
    expect(
      getApplicationDescriptionSummary(
        '![cover](https://example.com/a_(1).png) Intro',
      ),
    ).toBe('Intro');
  });

  it('collapses whitespace and keeps non-latin text', () => {
    expect(getApplicationDescriptionSummary('  هذا   وصف\n日本語  ')).toBe(
      'هذا وصف 日本語',
    );
  });
});
