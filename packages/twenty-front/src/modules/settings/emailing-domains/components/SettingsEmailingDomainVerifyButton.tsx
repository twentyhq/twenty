import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useToast } from 'twenty-ui/feedback';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { VerifyEmailingDomainDocument } from '~/generated-metadata/graphql';

type SettingsEmailingDomainVerifyButtonProps = {
  emailingDomainId: string;
};

export const SettingsEmailingDomainVerifyButton = ({
  emailingDomainId,
}: SettingsEmailingDomainVerifyButtonProps) => {
  const { t } = useLingui();
  const { add: addToast } = useToast();
  const { addErrorToast } = useErrorToast();
  const [verifyEmailingDomain, { loading }] = useMutation(
    VerifyEmailingDomainDocument,
  );

  const handleVerify = async () => {
    try {
      await verifyEmailingDomain({ variables: { id: emailingDomainId } });
      addToast({
        variant: 'success',
        children: t`Started verification process`,
      });
    } catch (error) {
      addErrorToast(error);
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
