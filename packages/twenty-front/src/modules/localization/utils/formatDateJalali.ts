import { isRtlLocale } from 'twenty-shared/utils';

type FormatDateJalaliOptions = {
  parse?: boolean;
  locale?: string;
};

const gDayOfMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

const gregorianToJalali = (gy: number, gm: number, gd: number) => {
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gDayOfMonth[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy + 1, jm, jd] as const;
};

const jalaliToGregorian = (jy: number, jm: number, jd: number) => {
  jy -= 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 1600 + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 0; gm < 13 && gd > salA[gm]; gm++) {
    gd -= salA[gm];
  }
  return [gy, gm, gd] as const;
};

export const formatDateJalali = (
  value: Date | string,
  opts: FormatDateJalaliOptions = {},
) => {
  const { parse = false, locale } = opts;
  const rtl = locale ? isRtlLocale(locale) : false;

  if (parse) {
    const [jy, jm, jd] = (value as string).split('-').map(Number);
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
    const date = new Date(Date.UTC(gy, gm - 1, gd, 0, 0, 0, 0));
    return date.toISOString();
  }

  const date = value instanceof Date ? value : new Date(value);
  const [jy, jm, jd] = gregorianToJalali(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
  const pad = (n: number) => n.toString().padStart(2, '0');
  return rtl ? `${jy}-${pad(jm)}-${pad(jd)}` : `${date.toISOString().slice(0, 10)}`;
};

export type { FormatDateJalaliOptions };
