import { AppChip } from '@/applications/components/AppChip';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getInstallCountEstimate } from '@/settings/applications/utils/getInstallCountEstimate';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined, isSafeUrl } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/components';
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
  tooltip?: string;
};

type ResourceLink = AboutRow & {
  href: string;
};

const isResourceLinkUrl = (url: string | undefined): url is string =>
  isNonEmptyString(url) && isSafeUrl(url);

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
  min-width: 0;
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
  const { formatNumber } = useNumberFormat();

  const getInstallCountRows = (): AboutRow[] => {
    if (!isDefined(installCount) || installCount <= 0) {
      return [];
    }

    const exactInstallCountLabel = plural(installCount, {
      one: `${formatNumber(installCount)} install`,
      other: `${formatNumber(installCount)} installs`,
    });
    const installCountEstimate = getInstallCountEstimate(installCount);

    if (!isDefined(installCountEstimate)) {
      return [{ Icon: IconDownload, label: exactInstallCountLabel }];
    }

    const estimatedInstallCount = formatNumber(installCountEstimate);

    return [
      {
        Icon: IconDownload,
        label: t`+${estimatedInstallCount} installs`,
        tooltip: exactInstallCountLabel,
      },
    ];
  };

  const aboutRows: AboutRow[] = [
    ...(isNonEmptyString(author)
      ? [{ Icon: IconUserCircle, label: t`by ${author}` }]
      : []),
    ...(isNonEmptyString(version)
      ? [{ Icon: IconVersions, label: version }]
      : []),
    ...getInstallCountRows(),
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
    ...(isResourceLinkUrl(websiteUrl)
      ? [{ Icon: IconWorld, label: t`Website`, href: websiteUrl }]
      : []),
    ...(isResourceLinkUrl(termsUrl)
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
    ...(isResourceLinkUrl(issueReportUrl)
      ? [
          {
            Icon: IconAlertTriangle,
            label: t`Report an issue`,
            href: issueReportUrl,
          },
        ]
      : []),
    ...(isResourceLinkUrl(sourcePackageUrl)
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
          <StyledName>
            <OverflowingTextWithTooltip text={displayName} />
          </StyledName>
          {isNonEmptyString(description) && (
            <StyledDescription>{description}</StyledDescription>
          )}
        </StyledIdentity>
        {isDefined(onShare) && (
          <Button
            startIcon={<IconShare2 />}
            variant="outline"
            size="sm"
            onClick={onShare}
          >{t`Share`}</Button>
        )}
      </StyledHeader>

      {aboutRows.length > 0 && (
        <StyledSection>
          <StyledSectionLabel>{t`About`}</StyledSectionLabel>
          {aboutRows.map(({ Icon, label, tooltip }) => (
            <StyledRow key={label}>
              <StyledRowIcon>
                <Icon size={theme.icon.size.sm} />
              </StyledRowIcon>
              <OverflowingTextWithTooltip
                text={label}
                tooltipContent={tooltip}
                alwaysShowTooltip={isDefined(tooltip)}
              />
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
              <OverflowingTextWithTooltip text={label} />
            </StyledResourceLink>
          ))}
        </StyledSection>
      )}
    </StyledSidebar>
  );
};
