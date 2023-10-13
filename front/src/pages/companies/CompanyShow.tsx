import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { CompanyTeam } from '@/companies/components/CompanyTeam';
import { useCompanyQuery } from '@/companies/hooks/useCompanyQuery';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { AppPath } from '@/types/AppPath';
import { FieldContext } from '@/ui/Data/Field/contexts/FieldContext';
import { InlineCell } from '@/ui/Data/Inline Cell/components/InlineCell';
import { PropertyBox } from '@/ui/Data/Inline Cell/property-box/components/PropertyBox';
import { InlineCellHotkeyScope } from '@/ui/Data/Inline Cell/types/InlineCellHotkeyScope';
import { IconBuildingSkyscraper } from '@/ui/Display/Icon';
import { PageBody } from '@/ui/Layout/Page/PageBody';
import { PageContainer } from '@/ui/Layout/Page/PageContainer';
import { PageFavoriteButton } from '@/ui/Layout/Page/PageFavoriteButton';
import { PageHeader } from '@/ui/Layout/Page/PageHeader';
import { ShowPageAddButton } from '@/ui/Layout/show-page/components/ShowPageAddButton';
import { ShowPageLeftContainer } from '@/ui/Layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/Layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/Layout/show-page/components/ShowPageSummaryCard';
import { ShowPageRecoilScopeContext } from '@/ui/Layout/states/ShowPageRecoilScopeContext';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { CompanyNameEditableField } from '../../modules/companies/editable-field/components/CompanyNameEditableField';
import { ShowPageContainer } from '../../modules/ui/Layout/Page/ShowPageContainer';

import { companyShowFieldDefinition } from './constants/companyShowFieldDefinition';

export const CompanyShow = () => {
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

  const handleFavoriteButtonClick = async () => {
    if (isFavorite) deleteCompanyFavorite(companyId);
    else insertCompanyFavorite(companyId);
  };

  return (
    <PageContainer>
      <PageTitle title={company.name || 'No Name'} />
      <PageHeader
        title={company.name ?? ''}
        hasBackButton
        Icon={IconBuildingSkyscraper}
      >
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
                avatarType="squared"
              />
              <PropertyBox extraPadding={true}>
                {companyShowFieldDefinition.map((fieldDefinition) => {
                  return (
                    <FieldContext.Provider
                      key={company.id + fieldDefinition.key}
                      value={{
                        entityId: company.id,
                        recoilScopeId: company.id + fieldDefinition.key,
                        fieldDefinition,
                        useUpdateEntityMutation: useUpdateOneCompanyMutation,
                        hotkeyScope: InlineCellHotkeyScope.InlineCell,
                      }}
                    >
                      <InlineCell />
                    </FieldContext.Provider>
                  );
                })}
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
};
