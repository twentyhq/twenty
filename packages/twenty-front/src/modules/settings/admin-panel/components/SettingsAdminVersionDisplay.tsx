import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

type SettingsAdminVersionDisplayProps = {
  version: string | undefined | null;
  loading: boolean;
  noVersionMessage: string;
};

const StyledActionLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.primary};
    cursor: pointer;
  }
`;

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
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
