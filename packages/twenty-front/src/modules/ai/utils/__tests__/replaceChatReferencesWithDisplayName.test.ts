import { replaceChatReferencesWithDisplayName } from '@/ai/utils/replaceChatReferencesWithDisplayName';

describe('replaceChatReferencesWithDisplayName', () => {
  it('replaces record references with their display name', () => {
    expect(
      replaceChatReferencesWithDisplayName(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe('Contact Acme next');
  });

  it('keeps replacement patterns in a display name as written', () => {
    expect(
      replaceChatReferencesWithDisplayName(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:A$&B $$ Co]] next',
      ),
    ).toBe('Contact A$&B $$ Co next');
  });
});
