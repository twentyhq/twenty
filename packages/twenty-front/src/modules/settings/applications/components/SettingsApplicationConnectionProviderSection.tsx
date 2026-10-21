import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsApplicationConnectionProviderSectionProps = {
  provider: {
    displayName: string;
    logoUrl?: string | null;
    oauth?: { isClientCredentialsConfigured: boolean } | null;
  };
  description: string;
  shouldShowMissingCredentialsBanner: boolean;
  children: ReactNode;
};

export const SettingsApplicationConnectionProviderSection = ({
  provider,
  description,
  shouldShowMissingCredentialsBanner,
  children,
}: SettingsApplicationConnectionProviderSectionProps) => {
  const { t } = useLingui();

  const isMissingClientCredentials = !(
    provider.oauth?.isClientCredentialsConfigured ?? false
  );

  return (
    <Section.Root>
      <Section.Header
        title={provider.displayName}
        description={description}
        actions={
          isNonEmptyString(provider.logoUrl) ? (
            <Avatar
              shape="square"
              variant="outline"
              src={getAbsoluteImageUrl(provider.logoUrl)}
              name={provider.displayName}
            />
          ) : undefined
        }
      />
      {shouldShowMissingCredentialsBanner && isMissingClientCredentials && (
        <InlineBanner
          layout="compact"
          status="error"
          fullWidth
        >{t`${provider.displayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.`}</InlineBanner>
      )}
      {children}
    </Section.Root>
  );
};
