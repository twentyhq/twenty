import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';

// Guards the date-fns v3+ migration: per-locale entrypoints dropped their typed
// `default` export, so the loader reads the single named export via
// Object.values(m)[0]. These tests fail if that resolution regresses.
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

  it('should fall back to en-US for an unknown locale', async () => {
    const locale = await getDateFnsLocale('zz-ZZ');

    expect(locale?.code).toBe('en-US');
  });

  it('should fall back to en-US for nullish input', async () => {
    expect((await getDateFnsLocale(undefined))?.code).toBe('en-US');
    expect((await getDateFnsLocale(null))?.code).toBe('en-US');
  });
});
