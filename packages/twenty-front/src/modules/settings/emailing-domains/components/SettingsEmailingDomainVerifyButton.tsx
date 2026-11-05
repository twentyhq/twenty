import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  EmailingDomainStatus,
  VerifyEmailingDomainDocument,
} from '~/generated-metadata/graphql';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/components/feedback';

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
      const { data } = await verifyEmailingDomain({
        variables: { id: emailingDomainId },
      });

      switch (data?.verifyEmailingDomain.status) {
        case EmailingDomainStatus.VERIFIED:
          enqueueToast({ status: 'success', children: t`Domain verified` });
          break;
        case EmailingDomainStatus.FAILED:
          enqueueToast({
            status: 'error',
            children: t`We can't find your DNS records yet. Check them at your DNS provider and try again.`,
          });
          break;
        case EmailingDomainStatus.PENDING:
        case EmailingDomainStatus.TEMPORARY_FAILURE:
          enqueueToast({
            status: 'info',
            children: t`Your records are being checked. This can take a few minutes.`,
          });
      }
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
