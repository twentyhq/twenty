import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
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

export const SettingsApplicationsAvailableTab = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: marketplaceApps, isLoading } = useMarketplaceApps();

  // Only vetted (featured) applications are exposed on the marketplace tab.
  const vettedApplications = marketplaceApps.filter(
    (application) => application.isFeatured,
  );

  const filteredApplications = searchTerm
    ? vettedApplications.filter((application) => {
        const lowerSearch = searchTerm.toLowerCase();

        return (
          application.name.toLowerCase().includes(lowerSearch) ||
          application.description.toLowerCase().includes(lowerSearch) ||
          application.author.toLowerCase().includes(lowerSearch)
        );
      })
    : vettedApplications;

  if (isLoading) {
    return (
      <Section>
        <SettingsEmptyPlaceholder padding="4">{t`Loading applications...`}</SettingsEmptyPlaceholder>
      </Section>
    );
  }

  return (
    <Section>
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>

      {filteredApplications.length === 0 ? (
        <SettingsEmptyPlaceholder padding="4">
          {t`No applications available`}
        </SettingsEmptyPlaceholder>
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
