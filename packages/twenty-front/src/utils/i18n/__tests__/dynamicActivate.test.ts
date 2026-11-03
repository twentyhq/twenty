import { i18n } from '@lingui/core';

import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

describe('dynamicActivate', () => {
  it('lays the document out right to left for a right-to-left locale', async () => {
    await dynamicActivate('he-IL');

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he-IL');
  });

  it('lays it back out left to right when the locale changes', async () => {
    await dynamicActivate('ar-SA');
    await dynamicActivate('fr-FR');

    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('fr-FR');
  });

  it('keeps the document attributes in sync when the locale is already active', async () => {
    await dynamicActivate('he-IL');
    document.documentElement.lang = '';
    document.documentElement.dir = '';

    await dynamicActivate('he-IL');

    expect(document.documentElement.lang).toBe('he-IL');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('does not notify listeners when the locale is already active', async () => {
    await dynamicActivate('fr-FR');
    const onChange = jest.fn();
    const unsubscribe = i18n.on('change', onChange);

    await dynamicActivate('fr-FR');

    unsubscribe();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('activates once when the same locale is requested twice concurrently', async () => {
    await dynamicActivate('en');
    const onChange = jest.fn();
    const unsubscribe = i18n.on('change', onChange);

    await Promise.all([dynamicActivate('de-DE'), dynamicActivate('de-DE')]);

    unsubscribe();
    expect(i18n.locale).toBe('de-DE');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('keeps the latest requested locale when an earlier activation resolves last', async () => {
    await dynamicActivate('en');

    const pendingFrench = dynamicActivate('fr-FR');
    await dynamicActivate('en');
    await pendingFrench;

    expect(i18n.locale).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to the source locale for an unknown one', async () => {
    await dynamicActivate('zz-ZZ' as 'en');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
