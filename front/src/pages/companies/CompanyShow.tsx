import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useCompanyQuery } from '@/companies/hooks/useCompanyQuery';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { AppPath } from '@/types/AppPath';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { GenericEditableField } from '@/ui/editable-field/components/GenericEditableField';
import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { EditableFieldMutationContext } from '@/ui/editable-field/contexts/EditableFieldMutationContext';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/components/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/components/PageHeader';
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
  const { data, loading } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  useEffect(() => {
    if (!loading && !company) {
      navigate(AppPath.NotFound);
    }
  }, [loading, company, navigate]);

  if (!company) return <></>;

  const isFavorite =
    company.Favorite && company.Favorite?.length > 0 ? true : false;

  async function handleFavoriteButtonClick() {
    if (isFavorite) deleteCompanyFavorite(companyId);
    else insertCompanyFavorite(companyId);
  }

  return (
    <PageContainer>
      <PageTitle title={company.name || 'No Name'} />
      <PageHeader
        title={company.name ?? ''}
        hasBackButton
        Icon={IconBuildingSkyscraper}
      >
        <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
          <PageFavoriteButton
            isFavorite={isFavorite}
            onClick={handleFavoriteButtonClick}
          />
          <ShowPageAddButton
            key="add"
            entity={{
              id: company.id,
              type: ActivityTargetableEntityType.Company,
            }}
          />
        </RecoilScope>
      </PageHeader>
      <PageBody>
        <RecoilScope CustomRecoilScopeContext={ShowPageRecoilScopeContext}>
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
                          key={fieldDefinition.key}
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
      </PageBody>
    </PageContainer>
  );
}
