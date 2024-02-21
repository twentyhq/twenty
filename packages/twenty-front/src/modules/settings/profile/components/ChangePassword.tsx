import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';
import useI18n from '@/ui/i18n/useI18n';

export const ChangePassword = () => {
  const { translate } = useI18n('translations');
  const { enqueueSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);

  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handlePasswordResetClick = async () => {
    if (!currentUser?.email) {
      enqueueSnackBar(translate('invalidEmail'), {
        variant: 'error',
      });
      return;
    }

    try {
      const { data } = await emailPasswordResetLink({
        variables: {
          email: currentUser.email,
        },
      });
      if (data?.emailPasswordResetLink?.success) {
        enqueueSnackBar(translate('passwordResetLinkHasBeenSentToTheEmail'), {
          variant: 'success',
        });
      } else {
        enqueueSnackBar(translate('thereWasSomeIssue'), {
          variant: 'error',
        });
      }
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <H2Title
        title={translate('changePassword')}
        description={translate('receiveAnEmailContainingPasswordUpdateLink')}
      />
      <Button
        onClick={handlePasswordResetClick}
        variant="secondary"
        title={translate('changePassword')}
      />
    </>
  );
};
