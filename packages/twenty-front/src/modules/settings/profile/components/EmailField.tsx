import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInput } from '@/ui/input/components/TextInput';

export const EmailField = () => {
  const currentUser = useRecoilValue(currentUserState);

  return (
    <TextInput
      instanceId={`user-email-${currentUser?.id}`}
      value={currentUser?.email}
      disabled
      fullWidth
      key={'email-' + currentUser?.id}
    />
  );
};
