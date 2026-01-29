import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { IconFilter, IconSearch } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';
import { AVAILABLE_APPLICATIONS } from '~/pages/settings/applications/constants/availableApplications';
import { useMarketplaceApps } from '~/pages/settings/applications/hooks/useMarketplaceApps';
import { type AvailableApplication } from '~/pages/settings/applications/types/availableApplication';

const StyledSearchContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
`;

const StyledCategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledCategoryTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

export const SettingsApplicationsAvailableTab = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: marketplaceApps, isLoading } = useMarketplaceApps();

  const applications = marketplaceApps ?? AVAILABLE_APPLICATIONS;

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application: AvailableApplication) =>
        application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.author.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [applications, searchTerm]);

  const applicationsByCategory = useMemo(() => {
    return filteredApplications.reduce(
      (
        acc: Record<string, AvailableApplication[]>,
        application: AvailableApplication,
      ) => {
        const category = application.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(application);
        return acc;
      },
      {} as Record<string, AvailableApplication[]>,
    );
  }, [filteredApplications]);

  const categories = Object.keys(applicationsByCategory);

  if (isLoading) {
    return (
      <Section>
        <StyledEmptyState>{t`Loading applications...`}</StyledEmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <StyledSearchContainer>
        <StyledSearchInput
          instanceId="available-apps-search"
          LeftIcon={IconSearch}
          placeholder={t`Search an application`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <LightIconButton Icon={IconFilter} accent="tertiary" />
      </StyledSearchContainer>

      {categories.length === 0 ? (
        <StyledEmptyState>{t`No applications available`}</StyledEmptyState>
      ) : (
        categories.map((category) => (
          <StyledCategorySection key={category}>
            <StyledCategoryTitle>{category}</StyledCategoryTitle>
            <StyledCardsGrid>
              {applicationsByCategory[category].map(
                (application: AvailableApplication) => (
                  <SettingsAvailableApplicationCard
                    key={application.id}
                    application={application}
                  />
                ),
              )}
            </StyledCardsGrid>
          </StyledCategorySection>
        ))
      )}
    </Section>
  );
};
