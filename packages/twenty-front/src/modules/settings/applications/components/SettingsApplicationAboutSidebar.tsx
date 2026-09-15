import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconBrandNpm,
  type IconComponent,
  IconCurrencyDollar,
  IconDownload,
  IconLink,
  IconMail,
  IconShare2,
  IconTag,
  IconUserCircle,
  IconVersions,
  IconWorld,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type DeveloperLinks = {
  websiteUrl?: string;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  sourcePackageUrl?: string;
};

type SettingsApplicationAboutSidebarProps = {
  applicationId?: string | null;
  logoUrl?: string | null;
  displayName: string;
  description?: string;
  onShare?: () => void;
  author?: string;
  version?: string;
  installCount?: number;
  category?: string;
  pricingDescription?: string;
  developerLinks?: DeveloperLinks;
};

type AboutRow = {
  Icon: IconComponent;
  label: string;
};

type ResourceLink = AboutRow & {
  href: string;
};

const isSafeUrl = (url: string | undefined): url is string => {
  if (!isNonEmptyString(url)) return false;

  try {
    const parsed = new URL(url);

    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  min-width: 0;
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.4;
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledResourceLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.4;
  min-height: ${themeCssVariables.spacing[6]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledRowIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const StyledRowLabel = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const SettingsApplicationAboutSidebar = ({
  applicationId,
  logoUrl,
  displayName,
  description,
  onShare,
  author,
  version,
  installCount,
  category,
  pricingDescription,
  developerLinks,
}: SettingsApplicationAboutSidebarProps) => {
  const { theme } = useContext(ThemeContext);

  const aboutRows: AboutRow[] = [
    ...(isNonEmptyString(author)
      ? [{ Icon: IconUserCircle, label: t`by ${author}` }]
      : []),
    ...(isNonEmptyString(version)
      ? [{ Icon: IconVersions, label: version }]
      : []),
    ...(isDefined(installCount)
      ? [
          {
            Icon: IconDownload,
            label: plural(installCount, {
              one: '# install',
              other: '# installs',
            }),
          },
        ]
      : []),
    ...(isNonEmptyString(category) ? [{ Icon: IconTag, label: category }] : []),
    ...(isNonEmptyString(pricingDescription)
      ? [{ Icon: IconCurrencyDollar, label: pricingDescription }]
      : []),
  ];

  const {
    websiteUrl,
    termsUrl,
    emailSupport,
    issueReportUrl,
    sourcePackageUrl,
  } = developerLinks ?? {};

  const resourceLinks: ResourceLink[] = [
    ...(isSafeUrl(websiteUrl)
      ? [{ Icon: IconWorld, label: t`Website`, href: websiteUrl }]
      : []),
    ...(isSafeUrl(termsUrl)
      ? [{ Icon: IconLink, label: t`Terms / Privacy`, href: termsUrl }]
      : []),
    ...(isNonEmptyString(emailSupport)
      ? [
          {
            Icon: IconMail,
            label: t`Email support`,
            href: `mailto:${emailSupport}`,
          },
        ]
      : []),
    ...(isSafeUrl(issueReportUrl)
      ? [
          {
            Icon: IconAlertTriangle,
            label: t`Report an issue`,
            href: issueReportUrl,
          },
        ]
      : []),
    ...(isSafeUrl(sourcePackageUrl)
      ? [{ Icon: IconBrandNpm, label: t`Npm package`, href: sourcePackageUrl }]
      : []),
  ];

  return (
    <StyledSidebar>
      <StyledHeader>
        <AppChip
          applicationId={applicationId}
          logoUrl={logoUrl}
          fallbackApplicationData={{ name: displayName }}
          size="xl"
          chipOnly
        />
        <StyledIdentity>
          <StyledName>{displayName}</StyledName>
          {isNonEmptyString(description) && (
            <StyledDescription>{description}</StyledDescription>
          )}
        </StyledIdentity>
        {isDefined(onShare) && (
          <Button
            Icon={IconShare2}
            title={t`Share`}
            variant="secondary"
            size="small"
            onClick={onShare}
          />
        )}
      </StyledHeader>

      {aboutRows.length > 0 && (
        <StyledSection>
          <StyledSectionLabel>{t`About`}</StyledSectionLabel>
          {aboutRows.map(({ Icon, label }) => (
            <StyledRow key={label}>
              <StyledRowIcon>
                <Icon size={theme.icon.size.sm} />
              </StyledRowIcon>
              <StyledRowLabel>{label}</StyledRowLabel>
            </StyledRow>
          ))}
        </StyledSection>
      )}

      {resourceLinks.length > 0 && (
        <StyledSection>
          <StyledSectionLabel>{t`Resources`}</StyledSectionLabel>
          {resourceLinks.map(({ Icon, label, href }) => (
            <StyledResourceLink
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StyledRowIcon>
                <Icon size={theme.icon.size.sm} />
              </StyledRowIcon>
              <StyledRowLabel>{label}</StyledRowLabel>
            </StyledResourceLink>
          ))}
        </StyledSection>
      )}
    </StyledSidebar>
  );
};
