import { findBuiltInMcpClientApp } from '@/settings/app-preferences/utils/findBuiltInMcpClientApp';
import { getBuiltInAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAppLogoUrl';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationRegistrationSummary } from '~/generated-metadata/graphql';

type ApplicationLogoSource = {
  logoUrl?: string | null;
  applicationRegistration?: Pick<
    ApplicationRegistrationSummary,
    'wellKnownOAuthClient'
  > | null;
};

// OAuth-only installs have no bundle to carry a logo
export const getApplicationLogoUrl = ({
  logoUrl,
  applicationRegistration,
}: ApplicationLogoSource): string | undefined => {
  if (isDefined(logoUrl)) {
    return logoUrl;
  }

  const builtInMcpClientApp = findBuiltInMcpClientApp(
    applicationRegistration?.wellKnownOAuthClient,
  );

  return isDefined(builtInMcpClientApp)
    ? getBuiltInAppLogoUrl(builtInMcpClientApp)
    : undefined;
};
