import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { MY_PROFILE_FRONT_COMPONENT_ID } from 'src/modules/partner/self-service/constants/my-profile.constants';
import { callAppRoute } from 'src/modules/shared/front-components/call-app-route';

import { MarkdownEditor } from './my-profile/markdown-editor';
import { ProfilePictureUpload } from './my-profile/profile-picture-upload';
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
} from './my-profile/form-fields';
import { toProfileForm, toSaveBody, type ProfileForm } from './my-profile/profile-form';
import type {
  MyPartnerProfileResult,
  ProfileOptions,
  SaveResult,
} from './my-profile/types';

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
      const res = (await callAppRoute('/my-partner-profile', {})) as MyPartnerProfileResult;
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
          <Field label="Regions served">
            <ChipMultiSelect
              value={form.region}
              options={options.region}
              onChange={(value) => set('region', value)}
            />
          </Field>
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
