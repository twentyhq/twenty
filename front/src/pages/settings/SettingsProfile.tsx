import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TopTitle } from '@/ui/layout/top-bar/TopTitle';

export function SettingsProfile() {
  const currentUser = useRecoilValue(currentUserState);
  return (
    <div>
      <TopTitle title="Profile" />
      {currentUser?.displayName} <br /> {currentUser?.email}
    </div>
  );
}
