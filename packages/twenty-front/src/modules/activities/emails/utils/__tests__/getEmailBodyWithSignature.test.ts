import { getEmailBodyWithSignature } from '@/activities/emails/utils/getEmailBodyWithSignature';

describe('getEmailBodyWithSignature', () => {
  it('returns an empty body when no signature is set', () => {
    expect(getEmailBodyWithSignature(null)).toBe('');
  });

  it('adds a blank paragraph before the signature', () => {
    expect(getEmailBodyWithSignature('<p>Jane Doe</p>')).toBe(
      '<p></p><p>Jane Doe</p>',
    );
  });
});
