import { getDateFnsLocale } from './getDateFnsLocale.util';

describe('getDateFnsLocale', () => {
  it('returns the en-US locale for en', async () => {
    const locale = await getDateFnsLocale('en');
    expect(locale?.code).toBe('en-US');
  });

  it('returns the fa-IR locale for fa-IR', async () => {
    const locale = await getDateFnsLocale('fa-IR');
    expect(locale?.code).toBe('fa-IR');
  });
});
