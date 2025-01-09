import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTranslation } from 'react-i18next';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';

export const ChangePassword = () => {
  const { enqueueSnackBar } = useSnackBar();

  const { t } = useTranslation();

  const currentUser = useRecoilValue(currentUserState);

  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const handlePasswordResetClick = async () => {
    if (!currentUser?.email) {
      enqueueSnackBar(t('invalidEmail'), {
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
        enqueueSnackBar(t('changePasswordResetLink'), {
          variant: SnackBarVariant.Success,
        });
      } else {
        enqueueSnackBar(t('commonError'), {
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
        title={t('changePassword')}
        description={t('changePasswordDescription')}
      />
      <Button
        onClick={handlePasswordResetClick}
        variant="secondary"
        title={t('changePassword')}
      />
    </>
  );
};
