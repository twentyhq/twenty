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

  if (isLoading === true) {
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

      {filteredApplications.length === 0 ? (
        <StyledEmptyState>{t`No applications available`}</StyledEmptyState>
      ) : (
        <StyledCardsGrid>
          {filteredApplications.map((application: AvailableApplication) => (
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
