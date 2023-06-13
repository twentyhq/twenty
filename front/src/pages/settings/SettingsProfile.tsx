import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsPage } from '@/settings/components/SettingsPage';
import { TopTitle } from '@/ui/layout/top-bar/TopTitle';

export function SettingsProfile() {
  const currentUser = useRecoilValue(currentUserState);
  return (
    <SettingsPage>
      <>
        <TopTitle title="Profile" />
        <div>
          <h5>Name</h5>
          <span>{currentUser?.displayName} </span>
        </div>
        <div>
          <h5>Email</h5>
          <span>{currentUser?.email} </span>
        </div>
      </>
    </SettingsPage>
  );
}
