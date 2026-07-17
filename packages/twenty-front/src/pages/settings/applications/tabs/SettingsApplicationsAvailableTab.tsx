import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { InlineBanner } from 'twenty-ui/feedback';
import { IconSparkles } from 'twenty-ui/icon';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMarketplaceApps } from '~/modules/marketplace/hooks/useMarketplaceApps';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';

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

const StyledHintLink = styled.button`
  background: none;
  border: none;
  color: ${themeCssVariables.color.blue};
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
`;

export const SettingsApplicationsAvailableTab = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showVettedOnly, setShowVettedOnly] = useState(true);

  const { data: marketplaceApps, isLoading } = useMarketplaceApps();

  const textFilteredApplications = searchTerm
    ? marketplaceApps.filter((application) => {
        const lowerSearch = searchTerm.toLowerCase();

        return (
          application.name.toLowerCase().includes(lowerSearch) ||
          application.description.toLowerCase().includes(lowerSearch) ||
          application.author.toLowerCase().includes(lowerSearch)
        );
      })
    : marketplaceApps;

  const vettedApplications = textFilteredApplications.filter(
    (application) => application.isVetted,
  );

  const nonVettedApplications = textFilteredApplications.filter(
    (application) => !application.isVetted,
  );

  if (isLoading) {
    return (
      <Section>
        <SettingsEmptyPlaceholder padding="4">{t`Loading applications...`}</SettingsEmptyPlaceholder>
      </Section>
    );
  }

  const showNonVettedHint =
    showVettedOnly &&
    vettedApplications.length === 0 &&
    nonVettedApplications.length > 0;

  const hasNoApplications = textFilteredApplications.length === 0;

  return (
    <Section>
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onChange={setSearchTerm}
          filterDropdown={(filterButton: ReactNode) => (
            <Dropdown
              dropdownId="marketplace-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconSparkles}
                      onToggleChange={() => setShowVettedOnly(!showVettedOnly)}
                      toggled={showVettedOnly}
                      text={t`Vetted only`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchInputContainer>

      {hasNoApplications ||
      (showVettedOnly && vettedApplications.length === 0) ? (
        <SettingsEmptyPlaceholder padding="4">
          {showNonVettedHint
            ? t`No vetted applications found. ${nonVettedApplications.length} non-vetted result(s) available — `
            : t`No applications available`}
          {showNonVettedHint && (
            <StyledHintLink onClick={() => setShowVettedOnly(false)}>
              {t`show all`}
            </StyledHintLink>
          )}
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
              <InlineBanner
                color={'danger'}
                message={t`Applications below are not vetted. Use at your own risk.`}
              />
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
    </Section>
  );
};
