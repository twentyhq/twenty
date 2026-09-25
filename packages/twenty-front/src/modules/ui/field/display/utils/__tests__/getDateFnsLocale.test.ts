import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';

describe('getDateFnsLocale', () => {
  it('should load the default en-US locale', async () => {
    const locale = await getDateFnsLocale('en-US');

    expect(locale).toBeDefined();
    expect(locale?.code).toBe('en-US');
    expect(typeof locale?.formatDistance).toBe('function');
  });

  it('should load a non-default locale (fr-FR)', async () => {
    const locale = await getDateFnsLocale('fr-FR');

    expect(locale).toBeDefined();
    expect(locale?.code).toBe('fr');
  });

  // The switch has an en-US default, so a case pointing at a module path that
  // does not exist fails the same silent way a missing case would.
  it.each([
    ['fa-IR', 'fa-IR'],
    ['hy-AM', 'hy'],
    ['sr-Latn', 'sr-Latn'],
    ['uz-UZ', 'uz'],
  ])('should load %s from date-fns', async (appLocale, dateFnsCode) => {
    const locale = await getDateFnsLocale(appLocale);

    expect(locale?.code).toBe(dateFnsCode);
  });

  it('should fall back to en-US for an unknown locale', async () => {
    const locale = await getDateFnsLocale('zz-ZZ');

    expect(locale?.code).toBe('en-US');
  });

  it('should fall back to en-US for nullish input', async () => {
    expect((await getDateFnsLocale(undefined))?.code).toBe('en-US');
    expect((await getDateFnsLocale(null))?.code).toBe('en-US');
  });
});
