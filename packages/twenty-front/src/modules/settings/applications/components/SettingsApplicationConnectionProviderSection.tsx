import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsApplicationConnectionProviderSectionProps = {
  providerDisplayName: string;
  providerLogoUrl?: string | null;
  isClientCredentialsConfigured: boolean;
  description: string;
  shouldShowMissingCredentialsBanner: boolean;
  children: ReactNode;
};

export const SettingsApplicationConnectionProviderSection = ({
  providerDisplayName,
  providerLogoUrl,
  isClientCredentialsConfigured,
  description,
  shouldShowMissingCredentialsBanner,
  children,
}: SettingsApplicationConnectionProviderSectionProps) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header
        title={providerDisplayName}
        description={description}
        actions={
          isNonEmptyString(providerLogoUrl) ? (
            <Avatar
              shape="square"
              variant="outline"
              src={getAbsoluteImageUrl(providerLogoUrl)}
              name={providerDisplayName}
            />
          ) : undefined
        }
      />
      {shouldShowMissingCredentialsBanner && !isClientCredentialsConfigured && (
        <InlineBanner
          layout="compact"
          status="error"
          fullWidth
        >{t`${providerDisplayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.`}</InlineBanner>
      )}
      {children}
    </Section.Root>
  );
};
