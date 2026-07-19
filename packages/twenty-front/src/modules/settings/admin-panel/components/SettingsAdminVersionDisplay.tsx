import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAdminVersionDisplayProps = {
  version: string | undefined | null;
  loading: boolean;
  noVersionMessage: string;
};

const StyledActionLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;

  :hover {
    color: ${themeCssVariables.font.color.primary};
    cursor: pointer;
  }
`;

const StyledSpan = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

// Backend historically fell back to the docker tag name "latest" when it could
// not resolve a real release version. Treat that placeholder (and empty values)
// as "no version" so the admin panel never shows a useless "Latest" link.
const isResolvableVersion = (
  version: string | undefined | null,
): version is string => {
  if (!version) {
    return false;
  }

  const normalizedVersion = version.trim().toLowerCase();

  return (
    normalizedVersion.length > 0 &&
    normalizedVersion !== 'latest' &&
    normalizedVersion !== 'unknown'
  );
};

export const SettingsAdminVersionDisplay = ({
  version,
  loading,
  noVersionMessage,
}: SettingsAdminVersionDisplayProps) => {
  if (loading) {
    return <StyledSpan>{t`Loading...`}</StyledSpan>;
  }

  if (!isResolvableVersion(version)) {
    return <StyledSpan>{noVersionMessage}</StyledSpan>;
  }

  return (
    <StyledActionLink
      href={`https://hub.docker.com/r/twentycrm/twenty/tags?name=${version}`}
      target="_blank"
      rel="noreferrer"
    >
      {version}
    </StyledActionLink>
  );
};
