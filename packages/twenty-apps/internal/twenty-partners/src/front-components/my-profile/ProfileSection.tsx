import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { callAppRoute } from '../call-app-route';
import {
  type CurrencyValue,
  CurrencyField,
  MultiSelectField,
  ReadOnlyChips,
  SelectField,
  TextAreaField,
  TextField,
  UrlField,
} from './fields';
import { FileDrop } from './FileDrop';
import type { MyProfilePayload, ProfileOptions, SaveResult } from './types';

type ProfileSectionProps = {
  profile: MyProfilePayload;
  options: ProfileOptions;
  onSaved: (patch: Partial<MyProfilePayload>) => void;
};

type EditableProfileState = {
  name: string;
  introduction: string;
  city: string;
  country: string;
  languagesSpoken: string[];
  partnerScope: string[];
  skills: string;
  typeOfTeam: string;
  availability: string;
  hourlyRate: CurrencyValue | null;
  projectBudgetMin: CurrencyValue | null;
  website: string | null;
  linkedin: string | null;
  calendarLink: string | null;
};

const toCurrencyValue = (
  currency: MyProfilePayload['hourlyRate'],
): CurrencyValue | null => {
  if (!currency || currency.amountMicros === null || currency.currencyCode === null) return null;
  return { amountMicros: currency.amountMicros, currencyCode: currency.currencyCode };
};

const buildInitialState = (profile: MyProfilePayload): EditableProfileState => ({
  name: profile.name ?? '',
  introduction: profile.introduction ?? '',
  city: profile.city ?? '',
  country: profile.country ?? '',
  languagesSpoken: profile.languagesSpoken ?? [],
  partnerScope: profile.partnerScope ?? [],
  skills: (profile.skills ?? []).join(', '),
  typeOfTeam: profile.typeOfTeam ?? '',
  availability: profile.availability ?? '',
  hourlyRate: toCurrencyValue(profile.hourlyRate),
  projectBudgetMin: toCurrencyValue(profile.projectBudgetMin),
  website: profile.website,
  linkedin: profile.linkedin,
  calendarLink: profile.calendarLink,
});

const parseSkills = (value: string): string[] =>
  value
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

const buildSaveBody = (state: EditableProfileState): Record<string, unknown> => ({
  name: state.name,
  introduction: state.introduction,
  city: state.city,
  ...(state.country ? { country: state.country } : {}),
  languagesSpoken: state.languagesSpoken,
  partnerScope: state.partnerScope,
  skills: parseSkills(state.skills),
  ...(state.typeOfTeam ? { typeOfTeam: state.typeOfTeam } : {}),
  ...(state.availability ? { availability: state.availability } : {}),
  hourlyRate: state.hourlyRate,
  projectBudgetMin: state.projectBudgetMin,
  website: state.website,
  linkedin: state.linkedin,
  calendarLink: state.calendarLink,
});

const buildSavedPatch = (state: EditableProfileState): Partial<MyProfilePayload> => ({
  name: state.name || null,
  introduction: state.introduction || null,
  city: state.city || null,
  country: state.country || null,
  languagesSpoken: state.languagesSpoken,
  partnerScope: state.partnerScope,
  skills: parseSkills(state.skills),
  typeOfTeam: state.typeOfTeam || null,
  availability: state.availability || null,
  hourlyRate: state.hourlyRate,
  projectBudgetMin: state.projectBudgetMin,
  website: state.website,
  linkedin: state.linkedin,
  calendarLink: state.calendarLink,
});

export const ProfileSection = ({ profile, options, onSaved }: ProfileSectionProps) => {
  const [state, setState] = useState<EditableProfileState>(() => buildInitialState(profile));
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile.profilePictureUrl);
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof EditableProfileState>(
    key: K,
    value: EditableProfileState[K],
  ) => {
    setState((previous) => ({ ...previous, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = (await callAppRoute(
        '/save-my-partner-profile',
        buildSaveBody(state),
      )) as SaveResult;

      if (result.ok) {
        await enqueueSnackbar({ message: 'Profile saved', variant: 'success' });
        onSaved(buildSavedPatch(state));
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUploaded = (url: string) => {
    setProfilePictureUrl(url);
    onSaved({ profilePictureUrl: url });
  };

  return (
    <div>
      <FileDrop
        label="Profile picture"
        currentUrl={profilePictureUrl}
        target="profilePicture"
        onUploaded={handlePictureUploaded}
      />

      <TextField label="Name" value={state.name} onChange={(value) => updateField('name', value)} />
      <TextAreaField
        label="Introduction"
        value={state.introduction}
        onChange={(value) => updateField('introduction', value)}
      />
      <TextField label="City" value={state.city} onChange={(value) => updateField('city', value)} />
      <SelectField
        label="Country"
        value={state.country}
        options={options.country}
        onChange={(value) => updateField('country', value)}
      />
      <MultiSelectField
        label="Languages spoken"
        value={state.languagesSpoken}
        options={options.languagesSpoken}
        onChange={(value) => updateField('languagesSpoken', value)}
      />
      <MultiSelectField
        label="Partner scope"
        value={state.partnerScope}
        options={options.partnerScope}
        onChange={(value) => updateField('partnerScope', value)}
      />
      <TextField
        label="Skills (comma-separated)"
        value={state.skills}
        onChange={(value) => updateField('skills', value)}
      />
      <SelectField
        label="Type of team"
        value={state.typeOfTeam}
        options={options.typeOfTeam}
        onChange={(value) => updateField('typeOfTeam', value)}
      />
      <SelectField
        label="Availability"
        value={state.availability}
        options={options.availability}
        onChange={(value) => updateField('availability', value)}
      />
      <CurrencyField
        label="Hourly rate"
        value={state.hourlyRate}
        onChange={(value) => updateField('hourlyRate', value)}
      />
      <CurrencyField
        label="Minimum project budget"
        value={state.projectBudgetMin}
        onChange={(value) => updateField('projectBudgetMin', value)}
      />
      <UrlField
        label="Website"
        value={state.website}
        onChange={(value) => updateField('website', value)}
      />
      <UrlField
        label="LinkedIn"
        value={state.linkedin}
        onChange={(value) => updateField('linkedin', value)}
      />
      <UrlField
        label="Calendar link"
        value={state.calendarLink}
        onChange={(value) => updateField('calendarLink', value)}
      />

      <ReadOnlyChips label="Region" values={profile.region} />
      <ReadOnlyChips label="Deployment expertise" values={profile.deploymentExpertise} />

      <button type="button" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
};
