import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  IconAlertTriangle,
  IconBrandNpm,
  type IconComponent,
  IconLink,
  IconMail,
  IconWorld,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type ContentEntry = {
  icon: IconComponent;
  count: number;
  one: string;
  many: string;
};

export type DeveloperLinks = {
  websiteUrl?: string;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  sourcePackageUrl?: string;
};

type SettingsApplicationAboutSidebarProps = {
  actionButton?: ReactNode;
  author?: string;
  category?: string;
  contentEntries?: ContentEntry[];
  currentVersion?: string;
  latestAvailableVersion?: string;
  developerLinks?: DeveloperLinks;
};

const StyledSidebar = styled.div`
  flex-shrink: 0;
  width: 140px;
`;

const StyledSidebarSection = styled.div`
  padding: ${themeCssVariables.spacing[3]} 0;

  &:first-of-type {
    padding-top: 0;
  }
`;

const StyledSidebarLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSidebarValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledContentList = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const SettingsApplicationAboutSidebar = ({
  actionButton,
  author,
  category,
  contentEntries,
  currentVersion,
  latestAvailableVersion,
  developerLinks,
}: SettingsApplicationAboutSidebarProps) => {
  const isSafeUrl = (url: string | undefined): url is string => {
    if (!isNonEmptyString(url)) return false;

    try {
      const parsed = new URL(url);

      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const filteredContentEntries = (contentEntries ?? []).filter(
    (entry) => entry.count > 0,
  );

  const hasDeveloperLinks =
    isDefined(developerLinks) &&
    (isNonEmptyString(developerLinks.websiteUrl) ||
      isNonEmptyString(developerLinks.termsUrl) ||
      isNonEmptyString(developerLinks.emailSupport) ||
      isNonEmptyString(developerLinks.issueReportUrl) ||
      isNonEmptyString(developerLinks.sourcePackageUrl));

  return (
    <StyledSidebar>
      {isDefined(actionButton) && (
        <StyledSidebarSection>{actionButton}</StyledSidebarSection>
      )}

      {isDefined(author) && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Created by`}</StyledSidebarLabel>
          <StyledSidebarValue>{author}</StyledSidebarValue>
        </StyledSidebarSection>
      )}

      {isDefined(category) && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Category`}</StyledSidebarLabel>
          <StyledSidebarValue>{category}</StyledSidebarValue>
        </StyledSidebarSection>
      )}

      {filteredContentEntries.length > 0 && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Content`}</StyledSidebarLabel>
          <StyledContentList>
            {filteredContentEntries.map((entry) => (
              <Tag
                key={entry.one}
                color="gray"
                Icon={entry.icon}
                text={`${entry.count} ${
                  entry.count === 1 ? entry.one : entry.many
                }`}
              />
            ))}
          </StyledContentList>
        </StyledSidebarSection>
      )}

      {isDefined(currentVersion) && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Current`}</StyledSidebarLabel>
          <StyledSidebarValue>{currentVersion}</StyledSidebarValue>
        </StyledSidebarSection>
      )}

      {isDefined(latestAvailableVersion) && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Latest`}</StyledSidebarLabel>
          <StyledSidebarValue>{latestAvailableVersion}</StyledSidebarValue>
        </StyledSidebarSection>
      )}

      {hasDeveloperLinks && (
        <StyledSidebarSection>
          <StyledSidebarLabel>{t`Developers links`}</StyledSidebarLabel>
          {isSafeUrl(developerLinks.websiteUrl) && (
            <StyledLink
              href={developerLinks.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWorld size={16} />
              {t`Website`}
            </StyledLink>
          )}
          {isSafeUrl(developerLinks.termsUrl) && (
            <StyledLink
              href={developerLinks.termsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconLink size={16} />
              {t`Terms / Privacy`}
            </StyledLink>
          )}
          {isNonEmptyString(developerLinks.emailSupport) && (
            <StyledLink
              href={`mailto:${developerLinks.emailSupport}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconMail size={16} />
              {t`Email support`}
            </StyledLink>
          )}
          {isSafeUrl(developerLinks.issueReportUrl) && (
            <StyledLink
              href={developerLinks.issueReportUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconAlertTriangle size={16} />
              {t`Report an issue`}
            </StyledLink>
          )}
          {isSafeUrl(developerLinks.sourcePackageUrl) && (
            <StyledLink
              href={developerLinks.sourcePackageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandNpm size={16} />
              {t`Npm package`}
            </StyledLink>
          )}
        </StyledSidebarSection>
      )}
    </StyledSidebar>
  );
};
