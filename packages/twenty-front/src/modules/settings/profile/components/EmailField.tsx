import { useRecoilValue } from 'recoil';
import { TextInput } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';

export const EmailField = () => {
  const currentUser = useRecoilValue(currentUserState);

  return (
    <TextInput
      value={currentUser?.email}
      disabled
      fullWidth
      key={'email-' + currentUser?.id}
    />
  );
};
