import { buildRecipientErrorPage } from 'src/engine/core-modules/emailing-domain/utils/build-recipient-error-page.util';

const extractVisibleText = (page: string) => ({
  title: page.match(/<title>(.*?)<\/title>/)?.[1],
  heading: page.match(/<h1>(.*?)<\/h1>/)?.[1],
  body: page.match(/<p>(.*?)<\/p>/)?.[1],
});

describe('buildRecipientErrorPage', () => {
  it('tells the recipient a malformed link is not valid', () => {
    expect(extractVisibleText(buildRecipientErrorPage(400))).toEqual({
      title: 'This link is not valid',
      heading: 'This link is not valid',
      body: 'The link may be incomplete or expired. Open it again from the latest email you received.',
    });
  });

  it('tells the recipient an unknown link does not exist', () => {
    expect(extractVisibleText(buildRecipientErrorPage(404))).toEqual({
      title: 'Link not found',
      heading: 'Link not found',
      body: 'This link does not exist or is no longer available.',
    });
  });

  it('asks a throttled recipient to retry later', () => {
    expect(extractVisibleText(buildRecipientErrorPage(429))).toEqual({
      title: 'Too many requests',
      heading: 'Too many requests',
      body: 'Please wait a minute and try again.',
    });
  });

  it('shows a generic page when the server fails', () => {
    expect(extractVisibleText(buildRecipientErrorPage(500))).toEqual({
      title: 'Something went wrong',
      heading: 'Something went wrong',
      body: 'Please try again later.',
    });
  });
});
