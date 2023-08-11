import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useCompanyQuery } from '@/companies/queries';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/states/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/states/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/states/EditableFieldMutationContext';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import {
  CommentableType,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { CompanyNameEditableField } from '../../modules/companies/editable-field/components/CompanyNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

import { companyShowFieldDefinition } from './constants/companyShowFieldDefinition';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';
  const { insertCompanyFavorite, deleteCompanyFavorite } = useFavorites();

  const theme = useTheme();
  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  if (!company) return <></>;

  const isFavorite =
    company.Favorite && company.Favorite?.length > 0 ? true : false;

  async function handleFavoriteButtonClick() {
    if (isFavorite) deleteCompanyFavorite(companyId);
    else insertCompanyFavorite(companyId);
  }

  return (
    <WithTopBarContainer
      title={company.name ?? ''}
      hasBackButton
      isFavorite={isFavorite}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
      onFavoriteButtonClick={handleFavoriteButtonClick}
    >
      <ShowPageContainer>
        <ShowPageLeftContainer>
          <ShowPageSummaryCard
            id={company.id}
            logoOrAvatar={getLogoUrlFromDomainName(company.domainName ?? '')}
            title={company.name ?? 'No name'}
            date={company.createdAt ?? ''}
            renderTitleEditComponent={() => (
              <CompanyNameEditableField company={company} />
            )}
          />
          <PropertyBox extraPadding={true}>
            <EditableFieldMutationContext.Provider
              value={useUpdateOneCompanyMutation}
            >
              <EditableFieldEntityIdContext.Provider value={company.id}>
                {companyShowFieldDefinition.map((fieldDefinition) => {
                  return (
                    <EditableFieldDefinitionContext.Provider
                      value={fieldDefinition}
                      key={fieldDefinition.id}
                    >
                      <GenericEditableField />
                    </EditableFieldDefinitionContext.Provider>
                  );
                })}
              </EditableFieldEntityIdContext.Provider>
            </EditableFieldMutationContext.Provider>
          </PropertyBox>
          <CompanyTeam company={company}></CompanyTeam>
        </ShowPageLeftContainer>
        <ShowPageRightContainer>
          <Timeline
            entity={{ id: company.id ?? '', type: CommentableType.Company }}
          />
        </ShowPageRightContainer>
      </ShowPageContainer>
    </WithTopBarContainer>
  );
}
