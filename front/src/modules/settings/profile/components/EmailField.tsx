import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInputSettings } from '@/ui/input/text/components/TextInputSettings';

export const EmailField = () => {
  const currentUser = useRecoilValue(currentUserState);

  return (
    <TextInputSettings
      value={currentUser?.email}
      disabled
      fullWidth
      key={'email-' + currentUser?.id}
    />
  );
};
