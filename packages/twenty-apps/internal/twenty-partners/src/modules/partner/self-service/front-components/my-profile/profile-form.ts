import type { MyProfilePayload } from './types';

// Narrowed from the loader's payload so a field rename upstream breaks the build here.
export type ProfilePayload = Pick<
  MyProfilePayload,
  | 'id'
  | 'name'
  | 'profilePictureUrl'
  | 'introduction'
  | 'city'
  | 'country'
  | 'languagesSpoken'
  | 'region'
  | 'partnerScope'
  | 'skills'
  | 'typeOfTeam'
  | 'availability'
  | 'hourlyRate'
  | 'projectBudgetMin'
  | 'website'
  | 'linkedin'
  | 'calendarLink'
>;

export type Currency = MyProfilePayload['hourlyRate'];

export type MoneyField = { amount: number | null; currencyCode: string };

export type ProfileForm = {
  name: string;
  introduction: string;
  availability: string;
  typeOfTeam: string;
  hourlyRate: MoneyField;
  projectBudgetMin: MoneyField;
  partnerScope: string[];
  skills: string[];
  languagesSpoken: string[];
  region: string[];
  country: string;
  city: string;
  website: string;
  linkedin: string;
  calendarLink: string;
};

const MICROS = 1_000_000;

export const toMoneyField = (value: Currency): MoneyField => ({
  amount: value?.amountMicros != null ? value.amountMicros / MICROS : null,
  currencyCode: value?.currencyCode ?? 'USD',
});

export const toProfileForm = (profile: ProfilePayload): ProfileForm => ({
  name: profile.name ?? '',
  introduction: profile.introduction ?? '',
  availability: profile.availability ?? '',
  typeOfTeam: profile.typeOfTeam ?? '',
  hourlyRate: toMoneyField(profile.hourlyRate),
  projectBudgetMin: toMoneyField(profile.projectBudgetMin),
  partnerScope: profile.partnerScope ?? [],
  skills: profile.skills ?? [],
  languagesSpoken: profile.languagesSpoken ?? [],
  region: profile.region ?? [],
  country: profile.country ?? '',
  city: profile.city ?? '',
  website: profile.website ?? '',
  linkedin: profile.linkedin ?? '',
  calendarLink: profile.calendarLink ?? '',
});

export const toMicros = (money: MoneyField) =>
  money.amount == null
    ? null
    : { amountMicros: Math.round(money.amount * MICROS), currencyCode: money.currencyCode || 'USD' };

// Enum/country selectors send null (not '') when reset to blank so the field clears.
export const toSaveBody = (form: ProfileForm): Record<string, unknown> => ({
  name: form.name,
  introduction: form.introduction,
  city: form.city,
  languagesSpoken: form.languagesSpoken,
  region: form.region,
  partnerScope: form.partnerScope,
  skills: form.skills,
  website: form.website,
  linkedin: form.linkedin,
  calendarLink: form.calendarLink,
  hourlyRate: toMicros(form.hourlyRate),
  projectBudgetMin: toMicros(form.projectBudgetMin),
  availability: form.availability === '' ? null : form.availability,
  typeOfTeam: form.typeOfTeam === '' ? null : form.typeOfTeam,
  country: form.country === '' ? null : form.country,
});
