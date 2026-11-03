import { Button } from 'twenty-ui/primitives/input';
import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconEyeOff } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';
import { filterMarketplaceApps } from '~/pages/settings/applications/utils/filterMarketplaceApps';
import { SettingsSearchFilterTrigger } from '@/settings/components/SettingsSearchFilterTrigger';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledUnlistedContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationsAvailableTab = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlisted, setShowUnlisted] = useState(false);

  const {
    data: marketplaceApps,
    isLoading,
    error,
    refetch,
  } = useMarketplaceApps();

  const hasSearchTerm = searchTerm.trim().length > 0;

  const textFilteredApplications = filterMarketplaceApps({
    marketplaceApps,
    searchTerm,
  });

  const listedApplications = textFilteredApplications.filter(
    (application) => application.isListed,
  );

  const unlistedApplications = textFilteredApplications.filter(
    (application) => !application.isListed,
  );

  if (isLoading) {
    return (
      <Section.Root>
        <SettingsSectionSkeletonLoader />
      </Section.Root>
    );
  }

  if (isDefined(error)) {
    return (
      <Section.Root>
        <SettingsApplicationLoadErrorBanner
          message={t`The marketplace could not be loaded. Check your connection and try again.`}
          onRetry={() => refetch().catch(() => undefined)}
        />
      </Section.Root>
    );
  }

  const showUnlistedHint =
    !showUnlisted &&
    listedApplications.length === 0 &&
    unlistedApplications.length > 0;

  const hasNoApplications = textFilteredApplications.length === 0;

  const unlistedCount = unlistedApplications.length;

  const getEmptyStateMessage = () => {
    if (showUnlistedHint) {
      return plural(unlistedCount, {
        one: 'No listed application matches. # unlisted application is available.',
        other:
          'No listed application matches. # unlisted applications are available.',
      });
    }

    if (hasSearchTerm) {
      return t`No application matches your search`;
    }

    return t`No applications available yet`;
  };

  return (
    <Section.Root>
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onValueChange={setSearchTerm}
          actions={
            <DropdownRoot dropdownId="marketplace-filter-dropdown" type="panel">
              <SettingsSearchFilterTrigger ariaLabel={t`Filter applications`} />
              <DropdownContent
                side="bottom"
                align="end"
                sideOffset={8}
                alignOffset={0}
              >
                <Dropdown.Section>
                  <SettingsRow
                    startElement={<IconEyeOff />}
                    onCheckedChange={() => setShowUnlisted(!showUnlisted)}
                    checked={showUnlisted}
                  >{t`Show unlisted apps`}</SettingsRow>
                </Dropdown.Section>
              </DropdownContent>
            </DropdownRoot>
          }
        />
      </StyledSearchInputContainer>

      {hasNoApplications ||
      (!showUnlisted && listedApplications.length === 0) ? (
        <SettingsEmptyPlaceholder padding="4">
          <StyledEmptyState role="status">
            {getEmptyStateMessage()}
            {showUnlistedHint && (
              <Button
                variant="link"
                color="accent"
                size="sm"
                type="button"
                onClick={() => setShowUnlisted(true)}
              >
                {t`Show all applications`}
              </Button>
            )}
          </StyledEmptyState>
        </SettingsEmptyPlaceholder>
      ) : (
        <StyledContentContainer>
          {listedApplications.length > 0 && (
            <StyledCardsGrid>
              {listedApplications.map((application) => (
                <SettingsAvailableApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </StyledCardsGrid>
          )}

          {showUnlisted && unlistedApplications.length > 0 && (
            <StyledUnlistedContainer>
              <InlineBanner status="warning">{t`Applications below have not been reviewed by Twenty. Use at your own risk.`}</InlineBanner>
              <StyledCardsGrid>
                {unlistedApplications.map((application) => (
                  <SettingsAvailableApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </StyledCardsGrid>
            </StyledUnlistedContainer>
          )}
        </StyledContentContainer>
      )}
    </Section.Root>
  );
};
