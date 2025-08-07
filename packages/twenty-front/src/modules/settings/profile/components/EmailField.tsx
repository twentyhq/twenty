import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

export const EmailField = () => {
  const currentUser = useRecoilValue(currentUserState);

  return (
    <SettingsTextInput
      instanceId={`user-email-${currentUser?.id}`}
      value={currentUser?.email}
      disabled
      fullWidth
      key={'email-' + currentUser?.id}
    />
  );
};
