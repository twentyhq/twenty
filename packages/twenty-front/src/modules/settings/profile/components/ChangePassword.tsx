import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';

export const ChangePassword = () => {
  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);

  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handlePasswordResetClick = async () => {
    if (!currentUser?.email) {
      enqueueSnackBar(t`Invalid email`, {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    try {
      const { data } = await emailPasswordResetLink({
        variables: {
          email: currentUser.email,
        },
      });
      if (data?.emailPasswordResetLink?.success === true) {
        enqueueSnackBar(t`Password reset link has been sent to the email`, {
          variant: SnackBarVariant.Success,
        });
      } else {
        enqueueSnackBar(t`There was an issue`, {
          variant: SnackBarVariant.Error,
        });
      }
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <>
      <H2Title
        title={t`Change Password`}
        description={t`Receive an email containing password update link`}
      />
      <Button
        onClick={handlePasswordResetClick}
        variant="secondary"
        title={t`Change Password`}
      />
    </>
  );
};
