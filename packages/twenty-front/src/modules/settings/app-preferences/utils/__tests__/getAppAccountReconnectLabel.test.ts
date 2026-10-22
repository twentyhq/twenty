import { getAppAccountReconnectLabel } from '@/settings/app-preferences/utils/getAppAccountReconnectLabel';

const LABEL_CONTEXT = {
  applicationName: 'Linear',
  connectionLabel: 'Linear #2',
};

describe('getAppAccountReconnectLabel', () => {
  it.each([
    [true, 'Reconnect Linear (Linear #2)'],
    [false, 'Reconnect Linear'],
  ] as const)(
    'names the connection when hasOtherConnectionForApplication is %s',
    (hasOtherConnectionForApplication, expectedLabel) => {
      expect(
        getAppAccountReconnectLabel({
          ...LABEL_CONTEXT,
          hasOtherConnectionForApplication,
          isLabelledByApplication: true,
        }),
      ).toBe(expectedLabel);
    },
  );

  it('keeps the action plain for a single connection', () => {
    expect(
      getAppAccountReconnectLabel({
        ...LABEL_CONTEXT,
        hasOtherConnectionForApplication: false,
        isLabelledByApplication: false,
      }),
    ).toBe('Reconnect');
  });
});
