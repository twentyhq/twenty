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

export const SettingsAdminVersionDisplay = ({
  version,
  loading,
  noVersionMessage,
}: SettingsAdminVersionDisplayProps) => {
  if (loading) {
    return <StyledSpan>{t`Loading...`}</StyledSpan>;
  }

  if (!version) {
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
