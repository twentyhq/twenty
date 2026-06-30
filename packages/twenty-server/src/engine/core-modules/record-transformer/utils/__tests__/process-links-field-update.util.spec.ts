import { processLinksFieldUpdate } from 'src/engine/core-modules/record-transformer/utils/process-links-field-update.util';

describe('processLinksFieldUpdate', () => {
  it('should preserve omitted subfields when partially updating primaryLinkUrl', () => {
    expect(
      processLinksFieldUpdate(
        {
          primaryLinkUrl: 'HTTPS://EXAMPLE.COM',
        },
        {
          primaryLinkUrl: 'https://old.com',
          primaryLinkLabel: 'Old label',
          secondaryLinks: [
            { url: 'https://secondary.com', label: 'Secondary' },
          ],
        },
      ),
    ).toEqual({
      primaryLinkUrl: 'https://example.com',
      primaryLinkLabel: 'Old label',
      secondaryLinks: JSON.stringify([
        { url: 'https://secondary.com', label: 'Secondary' },
      ]),
    });
  });

  it('should promote first secondary link to primary when primary is cleared', () => {
    expect(
      processLinksFieldUpdate(
        {
          primaryLinkUrl: null,
        },
        {
          primaryLinkUrl: 'https://old.com',
          primaryLinkLabel: 'Old label',
          secondaryLinks: [
            { url: 'https://docs.twenty.com', label: 'Documentation' },
            { url: 'https://github.com/twentyhq/twenty', label: 'GitHub' },
          ],
        },
      ),
    ).toEqual({
      primaryLinkUrl: 'https://docs.twenty.com',
      primaryLinkLabel: 'Documentation',
      secondaryLinks: JSON.stringify([
        { url: 'https://github.com/twentyhq/twenty', label: 'GitHub' },
      ]),
    });
  });

  it('should clear all subfields when an empty object is provided', () => {
    expect(processLinksFieldUpdate({}, null)).toEqual({
      primaryLinkUrl: null,
      primaryLinkLabel: null,
      secondaryLinks: null,
    });
  });

  it('should return null when partial value is null', () => {
    expect(processLinksFieldUpdate(null, { primaryLinkUrl: 'https://old.com' })).toBeNull();
  });
});
