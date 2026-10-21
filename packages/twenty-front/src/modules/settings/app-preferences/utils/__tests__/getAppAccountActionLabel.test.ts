import { getAppAccountActionLabel } from '@/settings/app-preferences/utils/getAppAccountActionLabel';

const LABEL_CONTEXT = {
  applicationName: 'Linear',
  connectionLabel: 'Linear #2',
};

describe('getAppAccountActionLabel', () => {
  it.each([
    ['reconnect', true, 'Reconnect Linear (Linear #2)'],
    ['reconnect', false, 'Reconnect Linear'],
    ['remove', true, 'Remove Linear (Linear #2)'],
    ['remove', false, 'Remove Linear'],
  ] as const)(
    'names the %s action when hasOtherConnectionForApplication is %s',
    (action, hasOtherConnectionForApplication, expectedLabel) => {
      expect(
        getAppAccountActionLabel({
          action,
          ...LABEL_CONTEXT,
          hasOtherConnectionForApplication,
          isLabelledByApplication: true,
        }),
      ).toBe(expectedLabel);
    },
  );

  it.each([
    ['reconnect', 'Reconnect'],
    ['remove', 'Remove'],
  ] as const)(
    'keeps the %s action plain for a single connection',
    (action, expectedLabel) => {
      expect(
        getAppAccountActionLabel({
          action,
          ...LABEL_CONTEXT,
          hasOtherConnectionForApplication: false,
          isLabelledByApplication: false,
        }),
      ).toBe(expectedLabel);
    },
  );
});
