import {
  getEmailBodyWithSignature,
  getEmailBodyWithUpdatedSignature,
} from '@/activities/emails/utils/getEmailBodyWithSignature';

describe('getEmailBodyWithSignature', () => {
  it('returns an empty body when no signature is set', () => {
    expect(getEmailBodyWithSignature(null)).toBe('');
  });

  it('adds a blank paragraph before the signature', () => {
    expect(getEmailBodyWithSignature('<p>Jane Doe</p>')).toBe(
      '<p></p><p>Jane Doe</p>',
    );
  });

  it('replaces the previous trailing signature while preserving body content', () => {
    expect(
      getEmailBodyWithUpdatedSignature({
        body: '<p>Hello</p><p>Jane Doe</p>',
        previousEmailSignature: '<p>Jane Doe</p>',
        nextEmailSignature: '<p>John Smith</p>',
      }),
    ).toBe('<p>Hello</p><p></p><p>John Smith</p>');
  });

  it('removes the previous trailing signature when the next account has no signature', () => {
    expect(
      getEmailBodyWithUpdatedSignature({
        body: '<p>Hello</p><p>Jane Doe</p>',
        previousEmailSignature: '<p>Jane Doe</p>',
        nextEmailSignature: null,
      }),
    ).toBe('<p>Hello</p>');
  });

  it('appends the next signature when the previous signature is not present', () => {
    expect(
      getEmailBodyWithUpdatedSignature({
        body: '<p>Hello</p>',
        previousEmailSignature: '<p>Jane Doe</p>',
        nextEmailSignature: '<p>John Smith</p>',
      }),
    ).toBe('<p>Hello</p><p></p><p>John Smith</p>');
  });
});
