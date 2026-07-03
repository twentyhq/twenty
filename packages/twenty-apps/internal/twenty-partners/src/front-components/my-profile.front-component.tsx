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

const MyProfile = () => {
  const userId = useUserId();
  const [profile, setProfile] = useState<MyProfilePayload | null>(null);
  const [, setOptions] = useState<ProfileOptions | null>(null);
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
  if (!profile) return <div style={{ padding: 24 }}>No partner profile found for your account.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>{profile.name ?? 'My Profile'}</h1>
      {profile.introduction ? <p style={{ opacity: 0.8 }}>{profile.introduction}</p> : null}
      <p style={{ opacity: 0.6, fontSize: 13 }}>
        {[profile.city, profile.country].filter(Boolean).join(' · ')}
      </p>
      <p style={{ opacity: 0.6, fontSize: 13 }}>
        Links: {profile.links.length} · Services: {profile.services.length} · Case studies:{' '}
        {profile.caseStudies.length}
      </p>
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
