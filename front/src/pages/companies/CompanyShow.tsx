import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useCompanyQuery } from '@/companies/hooks/useCompanyQuery';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { AppPath } from '@/types/AppPath';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/contexts/EditableFieldMutationContext';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/layout/states/ShowPageRecoilScopeContext';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { CompanyNameEditableField } from '../../modules/companies/editable-field/components/CompanyNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

import { companyShowFieldDefinition } from './constants/companyShowFieldDefinition';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';
  const { insertCompanyFavorite, deleteCompanyFavorite } = useFavorites();

  const navigate = useNavigate();
  const theme = useTheme();
  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  if (!company) {
    navigate(AppPath.NotFound);
    return <></>;
  }

  const isFavorite =
    company.Favorite && company.Favorite?.length > 0 ? true : false;

  async function handleFavoriteButtonClick() {
    if (isFavorite) deleteCompanyFavorite(companyId);
    else insertCompanyFavorite(companyId);
  }

  return (
    <>
      <PageTitle title={company.name || 'No Name'} />
      <WithTopBarContainer
        title={company.name ?? ''}
        hasBackButton
        isFavorite={isFavorite}
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
        onFavoriteButtonClick={handleFavoriteButtonClick}
        extraButtons={[
          <ShowPageAddButton
            key="add"
            entity={{
              id: company.id,
              type: ActivityTargetableEntityType.Company,
            }}
          />,
        ]}
      >
        <RecoilScope SpecificContext={ShowPageRecoilScopeContext}>
          <ShowPageContainer>
            <ShowPageLeftContainer>
              <ShowPageSummaryCard
                id={company.id}
                logoOrAvatar={getLogoUrlFromDomainName(
                  company.domainName ?? '',
                )}
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
            <ShowPageRightContainer
              entity={{
                id: company.id,
                type: ActivityTargetableEntityType.Company,
              }}
              timeline
              tasks
              notes
              emails
            />
          </ShowPageContainer>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
