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

  it('falls back to the source locale for an unknown one', async () => {
    await dynamicActivate('zz-ZZ' as 'en');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
