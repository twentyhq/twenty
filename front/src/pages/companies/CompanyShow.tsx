import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import { useRecoilState } from 'recoil';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { CompanyAccountOwnerEditableField } from '@/companies/editable-field/components/CompanyAccountOwnerEditableField';
import { CompanyAddressEditableField } from '@/companies/editable-field/components/CompanyAddressEditableField';
import { CompanyCreatedAtEditableField } from '@/companies/editable-field/components/CompanyCreatedAtEditableField';
import { CompanyDomainNameEditableField } from '@/companies/editable-field/components/CompanyDomainNameEditableField';
import { CompanyEmployeesEditableField } from '@/companies/editable-field/components/CompanyEmployeesEditableField';
import { GET_COMPANY, useCompanyQuery } from '@/companies/queries';
import { GET_FAVORITES } from '@/favorites/queries/show';
import { currentFavorites } from '@/favorites/states/currentFavorites';
import { isFavorited } from '@/favorites/states/isFavorited';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { ShowPageLeftContainer } from '@/ui/layout/show-page/components/ShowPageLeftContainer';
import { ShowPageRightContainer } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { ShowPageSummaryCard } from '@/ui/layout/show-page/components/ShowPageSummaryCard';
import {
  CommentableType,
  useDeleteFavoriteMutation,
  useInsertCompanyFavoriteMutation,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { CompanyNameEditableField } from '../../modules/companies/editable-field/components/CompanyNameEditableField';
import { ShowPageContainer } from '../../modules/ui/layout/components/ShowPageContainer';

export function CompanyShow() {
  const companyId = useParams().companyId ?? '';
  const [insertCompanyFavorite] = useInsertCompanyFavoriteMutation();
  const [isFavorite, setIsFavorite] = useRecoilState(isFavorited);
  const [deleteFavorite] = useDeleteFavoriteMutation();
  const [_, setFavorites] = useRecoilState(currentFavorites);

  const theme = useTheme();
  const { data } = useCompanyQuery(companyId);
  const company = data?.findUniqueCompany;

  useEffect(() => {
    if (company) {
      const hasFavorite =
        company?.Favorite && company.Favorite.length > 0 ? true : false;
      console.log(hasFavorite);
      setIsFavorite(hasFavorite);
    } else {
      setIsFavorite(false);
    }
  }, [company, setIsFavorite]);

  if (!company) return <></>;

  async function handleFavoriteButtonClick() {
    if (isFavorite) {
      await deleteFavorite({
        variables: {
          where: {
            companyId: {
              equals: companyId,
            },
          },
        },
        onCompleted: (data) => {
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.id !== data.deleteFavorite.id),
          );
          setIsFavorite(false);
        },
        refetchQueries: [
          getOperationName(GET_FAVORITES) ?? '',
          getOperationName(GET_COMPANY) ?? '',
        ],
      });
    } else {
      await insertCompanyFavorite({
        variables: {
          data: {
            companyId,
          },
        },
        onCompleted: async (data) => {
          setFavorites((prevFavorites) => [
            ...prevFavorites,
            { person: null, ...data.createFavoriteForCompany },
          ]);
          setIsFavorite(true);
        },
        refetchQueries: [
          getOperationName(GET_FAVORITES) ?? '',
          getOperationName(GET_COMPANY) ?? '',
        ],
      });
    }
  }

  return (
    <WithTopBarContainer
      title={company?.name ?? ''}
      hasBackButton
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
