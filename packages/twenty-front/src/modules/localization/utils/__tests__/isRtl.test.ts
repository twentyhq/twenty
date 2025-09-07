import { i18n } from '@lingui/core';
import { isRtl } from '../isRtl';

describe('isRtl', () => {
  it('returns true for RTL locale', () => {
    i18n.load('fa-IR', {});
    i18n.activate('fa-IR');
    expect(isRtl()).toBe(true);
  });

  it('returns false for LTR locale', () => {
    i18n.load('en', {});
    i18n.activate('en');
    expect(isRtl()).toBe(false);
  });
});
