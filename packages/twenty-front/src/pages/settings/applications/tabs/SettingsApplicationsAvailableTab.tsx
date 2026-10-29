import { useMarketplaceApps } from '@/marketplace/hooks/useMarketplaceApps';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsAvailableApplicationCard } from '~/pages/settings/applications/components/SettingsAvailableApplicationCard';
import { filterMarketplaceApps } from '~/pages/settings/applications/utils/filterMarketplaceApps';

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

  const {
    data: marketplaceApps,
    isLoading,
    error,
    refetch,
  } = useMarketplaceApps();

  const hasSearchTerm = searchTerm.trim().length > 0;

  const filteredApplications = filterMarketplaceApps({
    marketplaceApps,
    searchTerm,
  });

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

  return (
    <Section.Root>
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      </StyledSearchInputContainer>

      {filteredApplications.length === 0 ? (
        <SettingsEmptyPlaceholder padding="4">
          <div role="status">
            {hasSearchTerm
              ? t`No application matches your search`
              : t`No applications available yet`}
          </div>
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
    </Section.Root>
  );
};
