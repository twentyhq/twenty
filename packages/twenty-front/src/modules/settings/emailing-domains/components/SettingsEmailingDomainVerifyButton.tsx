import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { VerifyEmailingDomainDocument } from '~/generated-metadata/graphql';
import { IconRefresh } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';

type SettingsEmailingDomainVerifyButtonProps = {
  emailingDomainId: string;
};

export const SettingsEmailingDomainVerifyButton = ({
  emailingDomainId,
}: SettingsEmailingDomainVerifyButtonProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [verifyEmailingDomain, { loading }] = useMutation(
    VerifyEmailingDomainDocument,
  );

  const handleVerify = async () => {
    try {
      await verifyEmailingDomain({ variables: { id: emailingDomainId } });
      enqueueSuccessSnackBar({ message: t`Started verification process` });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  return (
    <Button
      onClick={handleVerify}
      isLoading={loading}
      variant="secondary"
      Icon={IconRefresh}
      size="small"
      title={t`Check verification`}
      disabled={loading}
    />
  );
};
