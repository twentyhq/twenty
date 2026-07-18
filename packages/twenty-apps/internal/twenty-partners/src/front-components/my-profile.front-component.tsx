import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { MY_PROFILE_FRONT_COMPONENT_ID } from 'src/constants/my-profile.constants';

import { callAppRoute } from './call-app-route';
import { MarkdownEditor } from './my-profile/markdown-editor';
import { ProfilePictureUpload } from './my-profile/ProfilePictureUpload';
import {
  ChipMultiSelect,
  COLORS,
  CurrencyInput,
  Field,
  FONT,
  SelectInput,
  TagInput,
  TextInput,
  UrlInput,
  type SelectOption,
} from './my-profile/form-fields';

type Currency = { amountMicros: number | null; currencyCode: string | null } | null;

type ProfilePayload = {
  id: string;
  name: string | null;
  profilePictureUrl: string | null;
  introduction: string | null;
  city: string | null;
  country: string | null;
  languagesSpoken: string[] | null;
  partnerScope: string[] | null;
  skills: string[] | null;
  typeOfTeam: string | null;
  availability: string | null;
  hourlyRate: Currency;
  projectBudgetMin: Currency;
  website: string | null;
  linkedin: string | null;
  calendarLink: string | null;
};

type ProfileOptions = {
  country: SelectOption[];
  languagesSpoken: SelectOption[];
  partnerScope: SelectOption[];
  typeOfTeam: SelectOption[];
  availability: SelectOption[];
};

type LoadResult =
  | { ok: true; profile: ProfilePayload; options: ProfileOptions }
  | { ok: false; reason: string };
type SaveResult = { ok: true } | { ok: false; reason: string };

type MoneyField = { amount: number | null; currencyCode: string };

type ProfileForm = {
  name: string;
  introduction: string;
  availability: string;
  typeOfTeam: string;
  hourlyRate: MoneyField;
  projectBudgetMin: MoneyField;
  partnerScope: string[];
  skills: string[];
  languagesSpoken: string[];
  country: string;
  city: string;
  website: string;
  linkedin: string;
  calendarLink: string;
};

const SKILL_SUGGESTIONS = [
  'Migrations',
  'RevOps',
  'Reporting',
  'Forecasting',
  'Automations',
  'No-code ops',
  'API & SDK',
  'API integrations',
  'Self-hosted',
  'EU compliance',
  'Data import',
  'Onboarding',
  'Training',
  'Custom development',
];

const MICROS = 1_000_000;

const toMoneyField = (value: Currency): MoneyField => ({
  amount: value?.amountMicros != null ? value.amountMicros / MICROS : null,
  currencyCode: value?.currencyCode ?? 'USD',
});

const toProfileForm = (profile: ProfilePayload): ProfileForm => ({
  name: profile.name ?? '',
  introduction: profile.introduction ?? '',
  availability: profile.availability ?? '',
  typeOfTeam: profile.typeOfTeam ?? '',
  hourlyRate: toMoneyField(profile.hourlyRate),
  projectBudgetMin: toMoneyField(profile.projectBudgetMin),
  partnerScope: profile.partnerScope ?? [],
  skills: profile.skills ?? [],
  languagesSpoken: profile.languagesSpoken ?? [],
  country: profile.country ?? '',
  city: profile.city ?? '',
  website: profile.website ?? '',
  linkedin: profile.linkedin ?? '',
  calendarLink: profile.calendarLink ?? '',
});

const toMicros = (money: MoneyField) =>
  money.amount == null
    ? null
    : { amountMicros: Math.round(money.amount * MICROS), currencyCode: money.currencyCode || 'USD' };

// Enum/country selectors send null (not '') when reset to blank so the field clears.
const toSaveBody = (form: ProfileForm): Record<string, unknown> => ({
  name: form.name,
  introduction: form.introduction,
  city: form.city,
  languagesSpoken: form.languagesSpoken,
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

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    minHeight: 'calc(100dvh - 56px)',
    boxSizing: 'border-box',
    padding: 32,
    fontFamily: FONT,
    color: COLORS.fg,
    background: COLORS.bg,
  } as const,
  card: {
    width: '100%',
    maxWidth: '100%',
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  } as const,
  title: { fontSize: 20, fontWeight: 700, margin: 0 } as const,
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: 0,
  } as const,
  row2: { display: 'flex', gap: 12 } as const,
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 4,
    borderTop: `1px solid ${COLORS.border}`,
  } as const,
  button: {
    height: 40,
    borderRadius: 8,
    border: 'none',
    background: COLORS.accent,
    color: '#fff',
    fontSize: 14,
    fontWeight: 650,
    fontFamily: FONT,
    cursor: 'pointer',
    padding: '0 24px',
    marginTop: 16,
  } as const,
} as const;

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const MyProfile = () => {
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [options, setOptions] = useState<ProfileOptions | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await callAppRoute('/my-partner-profile', {})) as LoadResult;
      if (res.ok) {
        setForm(toProfileForm(res.profile));
        setOptions(res.options);
        setPictureUrl(res.profile.profilePictureUrl);
        setPartnerId(res.profile.id);
      } else {
        await enqueueSnackbar({ message: `Could not load profile: ${res.reason}`, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to load profile',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = (await callAppRoute('/save-my-partner-profile', toSaveBody(form))) as SaveResult;
      if (res.ok) {
        await enqueueSnackbar({ message: 'Profile saved', variant: 'success' });
        await load();
      } else {
        await enqueueSnackbar({ message: `Save failed: ${res.reason}`, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [form, load]);

  if (loading) return <div style={styles.root}>Loading…</div>;
  if (!form || !options) {
    return <div style={styles.root}>No partner profile found for your account.</div>;
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <h1 style={styles.title}>My Profile</h1>

        <Section title="Basics">
          {partnerId && (
            <Field label="Profile picture">
              <ProfilePictureUpload url={pictureUrl} recordId={partnerId} />
            </Field>
          )}
          <Field label="Name">
            <TextInput value={form.name} onChange={(value) => set('name', value)} />
          </Field>
          <Field label="Introduction">
            <MarkdownEditor
              value={form.introduction}
              onChange={(value) => set('introduction', value)}
              placeholder="Tell clients about your team…"
              ariaLabel="Introduction"
            />
          </Field>
        </Section>

        <Section title="Availability & engagement">
          <div style={styles.row2}>
            <div style={{ flex: 1 }}>
              <Field label="Availability">
                <SelectInput
                  value={form.availability}
                  options={options.availability}
                  onChange={(value) => set('availability', value)}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Type of team">
                <SelectInput
                  value={form.typeOfTeam}
                  options={options.typeOfTeam}
                  onChange={(value) => set('typeOfTeam', value)}
                />
              </Field>
            </div>
          </div>
          <div style={styles.row2}>
            <div style={{ flex: 1 }}>
              <Field label="Hourly rate">
                <CurrencyInput
                  amount={form.hourlyRate.amount}
                  currencyCode={form.hourlyRate.currencyCode}
                  onChange={(value) => set('hourlyRate', value)}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Min project budget">
                <CurrencyInput
                  amount={form.projectBudgetMin.amount}
                  currencyCode={form.projectBudgetMin.currencyCode}
                  onChange={(value) => set('projectBudgetMin', value)}
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Expertise">
          <Field label="Partner scope">
            <ChipMultiSelect
              value={form.partnerScope}
              options={options.partnerScope}
              onChange={(value) => set('partnerScope', value)}
            />
          </Field>
          <Field label="Skills">
            <TagInput
              value={form.skills}
              suggestions={SKILL_SUGGESTIONS}
              onChange={(value) => set('skills', value)}
            />
          </Field>
          <Field label="Languages spoken">
            <ChipMultiSelect
              value={form.languagesSpoken}
              options={options.languagesSpoken}
              onChange={(value) => set('languagesSpoken', value)}
            />
          </Field>
        </Section>

        <Section title="Location">
          <div style={styles.row2}>
            <div style={{ flex: 1 }}>
              <Field label="Country">
                <SelectInput
                  value={form.country}
                  options={options.country}
                  onChange={(value) => set('country', value)}
                />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="City">
                <TextInput value={form.city} onChange={(value) => set('city', value)} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Links">
          <Field label="Website">
            <UrlInput
              value={form.website}
              onChange={(value) => set('website', value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="LinkedIn">
            <UrlInput
              value={form.linkedin}
              onChange={(value) => set('linkedin', value)}
              placeholder="https://linkedin.com/…"
            />
          </Field>
          <Field label="Calendar link">
            <UrlInput
              value={form.calendarLink}
              onChange={(value) => set('calendarLink', value)}
              placeholder="https://cal.com/…"
            />
          </Field>
        </Section>

        <div style={styles.footer}>
          <button style={styles.button} onClick={() => void save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MY_PROFILE_FRONT_COMPONENT_ID,
  name: 'My Partner Profile',
  description: 'Self-service page for a partner to view and edit their profile.',
  component: MyProfile,
});
