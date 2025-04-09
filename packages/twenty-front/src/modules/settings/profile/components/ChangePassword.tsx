import { useLingui } from '@lingui/react/macro';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/display';

export const ChangePassword = () => {
  const { t } = useLingui();

  const { handleResetPassword } = useHandleResetPassword();

  return (
    <>
      <H2Title
        title={t`Change Password`}
        description={t`Receive an email containing password update link`}
      />
      <Button
        onClick={handleResetPassword()}
        variant="secondary"
        title={t`Change Password`}
      />
    </>
  );
};
