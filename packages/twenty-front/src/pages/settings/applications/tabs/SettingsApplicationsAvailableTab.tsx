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
import { IconSparkles } from 'twenty-ui/icon';
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

const StyledNotVettedContainer = styled.div`
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
  const [showVettedOnly, setShowVettedOnly] = useState(true);

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

  const vettedApplications = textFilteredApplications.filter(
    (application) => application.isVetted,
  );

  const nonVettedApplications = textFilteredApplications.filter(
    (application) => !application.isVetted,
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

  const showNonVettedHint =
    showVettedOnly &&
    vettedApplications.length === 0 &&
    nonVettedApplications.length > 0;

  const hasNoApplications = textFilteredApplications.length === 0;

  const nonVettedCount = nonVettedApplications.length;

  const getEmptyStateMessage = () => {
    if (showNonVettedHint) {
      return plural(nonVettedCount, {
        one: 'No vetted application matches. # non-vetted application is available.',
        other:
          'No vetted application matches. # non-vetted applications are available.',
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
                    startElement={<IconSparkles />}
                    onCheckedChange={() => setShowVettedOnly(!showVettedOnly)}
                    checked={showVettedOnly}
                  >{t`Vetted only`}</SettingsRow>
                </Dropdown.Section>
              </DropdownContent>
            </DropdownRoot>
          }
        />
      </StyledSearchInputContainer>

      {hasNoApplications ||
      (showVettedOnly && vettedApplications.length === 0) ? (
        <SettingsEmptyPlaceholder padding="4">
          <StyledEmptyState role="status">
            {getEmptyStateMessage()}
            {showNonVettedHint && (
              <Button
                variant="link"
                color="accent"
                size="sm"
                type="button"
                onClick={() => setShowVettedOnly(false)}
              >
                {t`Show all applications`}
              </Button>
            )}
          </StyledEmptyState>
        </SettingsEmptyPlaceholder>
      ) : (
        <StyledContentContainer>
          {vettedApplications.length > 0 && (
            <StyledCardsGrid>
              {vettedApplications.map((application) => (
                <SettingsAvailableApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </StyledCardsGrid>
          )}

          {!showVettedOnly && nonVettedApplications.length > 0 && (
            <StyledNotVettedContainer>
              <InlineBanner status="warning">{t`Applications below are not vetted. Use at your own risk.`}</InlineBanner>
              <StyledCardsGrid>
                {nonVettedApplications.map((application) => (
                  <SettingsAvailableApplicationCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </StyledCardsGrid>
            </StyledNotVettedContainer>
          )}
        </StyledContentContainer>
      )}
    </Section.Root>
  );
};
