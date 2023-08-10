import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { CompanyAccountOwnerEditableField } from '@/companies/editable-field/components/CompanyAccountOwnerEditableField';
import { CompanyAddressEditableField } from '@/companies/editable-field/components/CompanyAddressEditableField';
import { CompanyCreatedAtEditableField } from '@/companies/editable-field/components/CompanyCreatedAtEditableField';
import { CompanyDomainNameEditableField } from '@/companies/editable-field/components/CompanyDomainNameEditableField';
import { CompanyEmployeesEditableField } from '@/companies/editable-field/components/CompanyEmployeesEditableField';
import { useCompanyQuery } from '@/companies/queries';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { CommentableType } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { CompanyNameEditableField } from '../../modules/companies/editable-field/components/CompanyNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';
  const { InsertCompanyFavorite, DeleteCompanyFavorite } = useFavorites();

  const theme = useTheme();
  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;
  const isFavorite =
    company?.Favorite && company?.Favorite?.length > 0 ? true : false;

  if (!company) return <></>;

  async function handleFavoriteButtonClick() {
    if (isFavorite) DeleteCompanyFavorite(companyId);
    else InsertCompanyFavorite(companyId);
  }

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      hasBackButton
      isFavorite={isFavorite}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      onFavouriteButtonClick={handleFavoriteButtonClick}
    >
      <ShowPageContainer>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            id={company?.id}
            logoOrAvatar={getLogoUrlFromDomainName(company?.domainName ?? '')}
            title={company?.name ?? 'No name'}
            date={company?.createdAt ?? ''}
            renderTitleEditComponent={() => (
              <CompanyNameEditableField company={company} />
            )}
          />
          <PropertyBox extraPadding={true}>
            <CompanyDomainNameEditableField company={company} />
            <CompanyAccountOwnerEditableField company={company} />
            <CompanyEmployeesEditableField company={company} />
            <CompanyAddressEditableField company={company} />
            <CompanyCreatedAtEditableField company={company} />
          </PropertyBox>
          <CompanyTeam company={company}></CompanyTeam>
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: company?.id ?? '', type: CommentableType.Company }}
          />
        </ShowPageRightContainer>
      </ShowPageContainer>
    </WithTopBarContainer>
  );
}
