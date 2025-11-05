import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { currentUserState } from '@/auth/states/currentUserState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

export const SetOrChangePassword = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValue(currentUserState);

  const { handleResetPassword } = useHandleResetPassword();

  const hasPassword = currentUser?.hasPassword ?? false;
  const heading = hasPassword ? t`Change Password` : t`Set Password`;
  const description = hasPassword
    ? t`Receive an email containing password update link`
    : t`Receive an email containing password set link`;

  return (
    <>
      <H2Title title={heading} description={description} />
      <Button
        onClick={handleResetPassword()}
        variant="secondary"
        title={heading}
      />
    </>
  );
};
