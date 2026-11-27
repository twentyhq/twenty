import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';

type SettingsApplicationConnectionProviderSectionProps = {
  providerDisplayName: string;
  description: string;
  shouldShowMissingCredentialsBanner: boolean;
  children: ReactNode;
};

export const SettingsApplicationConnectionProviderSection = ({
  providerDisplayName,
  description,
  shouldShowMissingCredentialsBanner,
  children,
}: SettingsApplicationConnectionProviderSectionProps) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header title={providerDisplayName} description={description} />
      {shouldShowMissingCredentialsBanner && (
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
