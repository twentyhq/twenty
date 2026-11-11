import { getWebhookConditionObjectNameSingular } from '@/settings/developers/utils/getWebhookConditionObjectNameSingular';

describe('getWebhookConditionObjectNameSingular', () => {
  it('returns the object every operation targets', () => {
    expect(
      getWebhookConditionObjectNameSingular([
        { object: 'person', action: 'created' },
        { object: 'person', action: 'updated' },
        { object: null, action: '*' },
      ]),
    ).toBe('person');
  });

  it.each([
    ['several objects', ['person', 'company']],
    ['any object', ['*']],
    ['metadata', ['metadata.*']],
    ['no object', []],
  ])('returns nothing for %s', (_, objects) => {
    expect(
      getWebhookConditionObjectNameSingular(
        objects.map((object) => ({ object, action: 'created' })),
      ),
    ).toBeUndefined();
  });
});
