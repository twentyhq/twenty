import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useUserId } from 'twenty-sdk/front-component';

import { MY_PROFILE_FRONT_COMPONENT_ID } from 'src/constants/my-profile.constants';

import { callAppRoute } from './call-app-route';
import type {
  MyPartnerProfileResult,
  MyProfilePayload,
  ProfileOptions,
} from './my-profile/types';
import { ProfileSection } from './my-profile/ProfileSection';

const MyProfile = () => {
  const userId = useUserId();
  const [profile, setProfile] = useState<MyProfilePayload | null>(null);
  const [options, setOptions] = useState<ProfileOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const result = (await callAppRoute(
          '/my-partner-profile',
          {},
        )) as MyPartnerProfileResult;

        if (!alive) return;

        if (result.ok) {
          setProfile(result.profile);
          setOptions(result.options);
        } else {
          await enqueueSnackbar({
            message: `Could not load profile: ${result.reason}`,
            variant: 'error',
          });
        }
      } catch (error) {
        if (alive) {
          await enqueueSnackbar({
            message: error instanceof Error ? error.message : 'Failed to load profile',
            variant: 'error',
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!profile || !options) {
    return <div style={{ padding: 24 }}>No partner profile found for your account.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>{profile.name ?? 'My Profile'}</h1>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>
        Links: {profile.links.length} · Services: {profile.services.length} · Case studies:{' '}
        {profile.caseStudies.length}
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Profile</h2>
        <ProfileSection
          profile={profile}
          options={options}
          onSaved={(patch) => setProfile((previous) => (previous ? { ...previous, ...patch } : previous))}
        />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Links</h2>
        <p style={{ opacity: 0.5, fontSize: 13 }}>Coming soon.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Services</h2>
        <p style={{ opacity: 0.5, fontSize: 13 }}>Coming soon.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Case studies</h2>
        <p style={{ opacity: 0.5, fontSize: 13 }}>Coming soon.</p>
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
