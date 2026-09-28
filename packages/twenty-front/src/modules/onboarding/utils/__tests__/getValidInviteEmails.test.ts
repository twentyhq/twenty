import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';

describe('getValidInviteEmails', () => {
  it('should keep valid emails in their original order', () => {
    expect(
      getValidInviteEmails(['grace@example.com', 'alan@example.com']),
    ).toEqual(['grace@example.com', 'alan@example.com']);
  });

  it('should count a repeated email once', () => {
    expect(
      getValidInviteEmails([
        'grace@example.com',
        'alan@example.com',
        'grace@example.com',
      ]),
    ).toEqual(['grace@example.com', 'alan@example.com']);
  });

  it('should skip empty and undefined fields', () => {
    expect(getValidInviteEmails(['', undefined, 'grace@example.com'])).toEqual([
      'grace@example.com',
    ]);
  });

  it('should skip malformed emails', () => {
    expect(
      getValidInviteEmails([
        'katherine@example',
        'not an email',
        'alan@example.com',
      ]),
    ).toEqual(['alan@example.com']);
  });

  it('should skip emails with surrounding whitespace', () => {
    expect(getValidInviteEmails([' grace@example.com '])).toEqual([]);
  });
});
