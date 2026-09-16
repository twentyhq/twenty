import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { VerifyEmailingDomainDocument } from '~/generated-metadata/graphql';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/primitives/feedback';

type SettingsEmailingDomainVerifyButtonProps = {
  emailingDomainId: string;
};

export const SettingsEmailingDomainVerifyButton = ({
  emailingDomainId,
}: SettingsEmailingDomainVerifyButtonProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [verifyEmailingDomain, { loading }] = useMutation(
    VerifyEmailingDomainDocument,
  );

  const handleVerify = async () => {
    try {
      await verifyEmailingDomain({ variables: { id: emailingDomainId } });
      enqueueToast({
        variant: 'success',
        children: t`Started verification process`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <Button
      onClick={handleVerify}
      loading={loading}
      startIcon={<IconRefresh />}
      disabled={loading}
      variant="outline"
    >{t`Check verification`}</Button>
  );
};
