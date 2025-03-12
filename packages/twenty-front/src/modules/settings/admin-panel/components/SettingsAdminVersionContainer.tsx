import { IconCircleDot, IconComponent, IconStatusChange } from 'twenty-ui';

import { GITHUB_LINK } from '@ui/navigation/link/constants/GithubLink';

import { checkTwentyVersionExists } from '@/settings/admin-panel/utils/checkTwentyVersionExists';
import { fetchLatestTwentyRelease } from '@/settings/admin-panel/utils/fetchLatestTwentyRelease';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import packageJson from '../../../../../package.json';

const StyledVersionContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  display: grid;
`;

const StyledVersionDetails = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledVersionText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledActionLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.primary};
    cursor: pointer;
  }
`;

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type VersionDetail = {
  Icon: IconComponent;
  text: string;
  version: string | null;
  link: string;
  type: 'current' | 'latest';
};

export const SettingsAdminVersionContainer = () => {
  const theme = useTheme();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [currentVersionExists, setCurrentVersionExists] = useState(false);

  useEffect(() => {
    fetchLatestTwentyRelease().then(setLatestVersion);
    checkTwentyVersionExists(packageJson.version).then(setCurrentVersionExists);
  }, []);

  const VERSION_DETAILS: VersionDetail[] = [
    {
      Icon: IconCircleDot,
      text: t`Current version:`,
      version: packageJson.version,
      link: `${GITHUB_LINK}/releases/tag/v${packageJson.version}`,
      type: 'current',
    },
    {
      Icon: IconStatusChange,
      text: t`Latest version:`,
      version: latestVersion,
      link: `${GITHUB_LINK}/releases/tag/v${latestVersion}`,
      type: 'latest',
    },
  ];

  return (
    <StyledVersionContainer>
      {VERSION_DETAILS.map((versionDetail, index) => (
        <StyledVersionDetails key={index}>
          <versionDetail.Icon
            size={theme.icon.size.md}
            color={theme.font.color.tertiary}
          />
          <StyledVersionText>{versionDetail.text}</StyledVersionText>
          {versionDetail.version &&
          (versionDetail.type === 'current' ? currentVersionExists : true) ? (
            <StyledActionLink
              href={versionDetail.link}
              target="_blank"
              rel="noreferrer"
            >
              {versionDetail.version}
            </StyledActionLink>
          ) : (
            <StyledSpan>{versionDetail.version}</StyledSpan>
          )}
        </StyledVersionDetails>
      ))}
    </StyledVersionContainer>
  );
};
