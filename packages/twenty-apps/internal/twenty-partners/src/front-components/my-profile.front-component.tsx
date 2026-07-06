import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useUserId } from 'twenty-sdk/front-component';

import { MY_PROFILE_FRONT_COMPONENT_ID } from 'src/constants/my-profile.constants';

import { callAppRoute } from './call-app-route';
import type {
  MyPartnerProfileResult,
  MyProfilePayload,
  ProfileOptions,
} from './my-profile/types';
import { CaseStudiesSection } from './my-profile/CaseStudiesSection';
import { LinksSection } from './my-profile/LinksSection';
import { ProfileSection } from './my-profile/ProfileSection';
import { ServicesSection } from './my-profile/ServicesSection';

const MyProfile = () => {
  const userId = useUserId();
  const [profile, setProfile] = useState<MyProfilePayload | null>(null);
  const [options, setOptions] = useState<ProfileOptions | null>(null);
  const [loading, setLoading] = useState(true);
  // Bumped on every successful (re)load so section inputs remount from the
  // freshly-fetched server values — after a save, the persisted data is shown.
  const [version, setVersion] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      const result = (await callAppRoute('/my-partner-profile', {})) as MyPartnerProfileResult;
      if (result.ok) {
        setProfile(result.profile);
        setOptions(result.options);
        setVersion((previous) => previous + 1);
      } else {
        await enqueueSnackbar({
          message: `Could not load profile: ${result.reason}`,
          variant: 'error',
        });
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
    void loadProfile();
  }, [loadProfile, userId]);

  const refresh = () => {
    void loadProfile();
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!profile || !options) {
    return <div style={{ padding: 24 }}>No partner profile found for your account.</div>;
  }

  return (
    <div key={version} style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>{profile.name ?? 'My Profile'}</h1>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>
        Links: {profile.links.length} · Services: {profile.services.length} · Case studies:{' '}
        {profile.caseStudies.length}
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Profile</h2>
        <ProfileSection profile={profile} options={options} onSaved={refresh} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Links</h2>
        <LinksSection links={profile.links} onSaved={refresh} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Services</h2>
        <ServicesSection services={profile.services} onSaved={refresh} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Case studies</h2>
        <CaseStudiesSection caseStudies={profile.caseStudies} onSaved={refresh} />
      </section>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MY_PROFILE_FRONT_COMPONENT_ID,
  name: 'My Partner Profile',
  description:
    'Self-service page for a partner to view and edit their profile, links, services, and case studies.',
  component: MyProfile,
});
