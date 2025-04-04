import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { TWENTY_DOCKER_HUB_LINK } from 'twenty-shared/constants';
import { IconCircleDot, IconStatusChange } from 'twenty-ui/display';
import { useGetVersionInfoQuery } from '~/generated/graphql';
import packageJson from '../../../../../package.json';

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

export const SettingsAdminVersionContainer = () => {
  const { data } = useGetVersionInfoQuery({
    variables: { currentVersion: packageJson.version },
  });

  const { currentVersionExists, latestVersion } = data?.versionInfo ?? {};

  const versionItems = [
    {
      Icon: IconCircleDot,
      label: t`Current version`,
      value: currentVersionExists ? (
        <StyledActionLink
          href={`${TWENTY_DOCKER_HUB_LINK}/tags?name=${packageJson.version}`}
          target="_blank"
          rel="noreferrer"
        >
          {packageJson.version}
        </StyledActionLink>
      ) : (
        <StyledSpan>{packageJson.version}</StyledSpan>
      ),
    },
    {
      Icon: IconStatusChange,
      label: t`Latest version`,
      value: latestVersion ? (
        <StyledActionLink
          href={`${TWENTY_DOCKER_HUB_LINK}/tags?name=${latestVersion}`}
          target="_blank"
          rel="noreferrer"
        >
          {latestVersion}
        </StyledActionLink>
      ) : (
        <StyledSpan>{latestVersion ?? 'Loading...'}</StyledSpan>
      ),
    },
  ];

  return (
    <SettingsAdminTableCard
      rounded
      items={versionItems}
      gridAutoColumns="3fr 8fr"
    />
  );
};
