import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { DOCKER_HUB_LINK } from '@ui/navigation/link';
import { IconCircleDot, IconStatusChange } from 'twenty-ui';
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
  const { data: versionInfo } = useGetVersionInfoQuery({
    variables: { currentVersion: packageJson.version },
  });

  const versionItems = [
    {
      Icon: IconCircleDot,
      label: t`Current version`,
      value: versionInfo?.versionInfo.currentVersionExists ? (
        <StyledActionLink
          href={`${DOCKER_HUB_LINK}/tags?name=v${packageJson.version}`}
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
      value: versionInfo?.versionInfo.latestVersion ? (
        <StyledActionLink
          href={`${DOCKER_HUB_LINK}/tags?name=v${versionInfo.versionInfo.latestVersion}`}
          target="_blank"
          rel="noreferrer"
        >
          {versionInfo.versionInfo.latestVersion}
        </StyledActionLink>
      ) : (
        <StyledSpan>
          {versionInfo?.versionInfo.latestVersion ?? 'Loading...'}
        </StyledSpan>
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
