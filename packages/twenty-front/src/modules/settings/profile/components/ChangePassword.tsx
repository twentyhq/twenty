import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEmailPasswordResetLinkMutation } from '~/generated/graphql';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';

export const ChangePassword = () => {
  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();

  const currentUser = useRecoilValue(currentUserState);

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const [emailPasswordResetLink] = useEmailPasswordResetLinkMutation();

  const {handleResetPassword} = useHandleResetPassword()

  return (
    <>
      <H2Title
        title={t`Change Password`}
        description={t`Receive an email containing password update link`}
      />
      <Button
        onClick={handleResetPassword}
        variant="secondary"
        title={t`Change Password`}
      />
    </>
  );
};
