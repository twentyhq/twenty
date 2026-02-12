import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';
import { useMarketplaceApps } from '~/pages/settings/applications/hooks/useMarketplaceApps';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
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

  const applications = marketplaceApps;

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application) =>
        application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.author.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [applications, searchTerm]);

  if (isLoading) {
    return (
      <Section>
        <StyledEmptyState>{t`Loading applications...`}</StyledEmptyState>
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
        <StyledEmptyState>{t`No applications available`}</StyledEmptyState>
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
