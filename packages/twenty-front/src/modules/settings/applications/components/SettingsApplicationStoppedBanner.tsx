import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { IsApplicationStoppedDocument } from '~/generated-metadata/graphql';

type SettingsApplicationStoppedBannerProps = {
  applicationUniversalIdentifier?: string;
};

export const SettingsApplicationStoppedBanner = ({
  applicationUniversalIdentifier,
}: SettingsApplicationStoppedBannerProps) => {
  const { t } = useLingui();

  const { data } = useQuery(IsApplicationStoppedDocument, {
    variables: {
      applicationUniversalIdentifier: applicationUniversalIdentifier ?? '',
    },
    skip: !isNonEmptyString(applicationUniversalIdentifier),
    fetchPolicy: 'network-only',
  });

  if (!data?.isApplicationStopped) {
    return null;
  }

  return (
    <InlineBanner
      status="warning"
      icon={<IconAlertTriangle aria-hidden="true" />}
    >{t`We are currently encountering issues with this app, its behavior may be degraded while we work on a fix.`}</InlineBanner>
  );
};
