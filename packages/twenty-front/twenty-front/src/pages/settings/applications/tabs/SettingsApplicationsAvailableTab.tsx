import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { IconSparkles } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMarketplaceApps } from '~/modules/marketplace/hooks/useMarketplaceApps';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
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
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
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
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(true);

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

  const filteredApplications = showFeaturedOnly
    ? textFilteredApplications.filter((application) => application.isFeatured)
    : textFilteredApplications;

  const nonFeaturedCount = showFeaturedOnly
    ? textFilteredApplications.filter((application) => !application.isFeatured)
        .length
    : 0;

  if (isLoading) {
    return (
      <Section>
        <StyledEmptyState>{t`Loading applications...`}</StyledEmptyState>
      </Section>
    );
  }

  const showNonFeaturedHint =
    filteredApplications.length === 0 && nonFeaturedCount > 0;

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
                      onToggleChange={() =>
                        setShowFeaturedOnly(!showFeaturedOnly)
                      }
                      toggled={showFeaturedOnly}
                      text={t`Featured only`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchInputContainer>

      {filteredApplications.length === 0 ? (
        <StyledEmptyState>
          {showNonFeaturedHint
            ? t`No featured applications found. ${nonFeaturedCount} non-featured result(s) available — `
            : t`No applications available`}
          {showNonFeaturedHint && (
            <StyledHintLink onClick={() => setShowFeaturedOnly(false)}>
              {t`show all`}
            </StyledHintLink>
          )}
        </StyledEmptyState>
      ) : (
        <StyledCardsGrid>
          {filteredApplications.map((application) => (
            <SettingsAvailableApplicationCard
              key={application.id}
              application={application}
            />
          ))}
        </StyledCardsGrid>
      )}
    </Section>
  );
};
