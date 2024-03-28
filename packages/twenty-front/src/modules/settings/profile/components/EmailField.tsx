import { useRecoilValue } from 'recoil';
import { FieldTextInput } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';

export const EmailField = () => {
  const currentUser = useRecoilValue(currentUserState);

  return (
    <FieldTextInput
      value={currentUser?.email}
      disabled
      fullWidth
      key={'email-' + currentUser?.id}
    />
  );
};
