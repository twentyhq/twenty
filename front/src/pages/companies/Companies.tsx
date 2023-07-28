import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { GET_COMPANIES } from '@/companies/queries';
import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { TableActionBarButtonCreateActivityCompany } from '@/companies/table/components/TableActionBarButtonCreateActivityCompany';
import { TableActionBarButtonDeleteCompanies } from '@/companies/table/components/TableActionBarButtonDeleteCompanies';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectedRowIdsSelector';
import { TableContext } from '@/ui/table/states/TableContext';
import {
  FavoriteCreateManyInput,
  useInsertManyFavoritesMutation,
  useInsertOneCompanyMutation,
} from '~/generated/graphql';

import { SEARCH_COMPANY_QUERY } from '../../modules/search/queries/search';
import { GET_FAVORITES } from '@/favorites/queries/show';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertOneCompanyMutation();
  const [insertManyFavorites] = useInsertManyFavoritesMutation();
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  const resetRowSelection = useResetTableRowSelection();

  async function handleAddButtonClick() {
    await insertCompany({
      variables: {
        data: {
          name: '',
          domainName: '',
          address: '',
        },
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(SEARCH_COMPANY_QUERY) ?? '',
      ],
    });
  }

  async function handleFavoriteButtonClick() {
    const rowIdsToFavorite = selectedRowIds;
    if (rowIdsToFavorite.length > 0) {
      resetRowSelection();
      const favorites = rowIdsToFavorite.map((id) => {
        return {
          companyId: id,
        } as FavoriteCreateManyInput;
      });

      await insertManyFavorites({
        variables: {
          data: favorites,
        },
        refetchQueries: [getOperationName(GET_FAVORITES) ?? ''],
      });
    }
  }

  const theme = useTheme();

  return (
    <>
      <WithTopBarContainer
        title="Companies"
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
        onAddButtonClick={handleAddButtonClick}
        onFavouriteButtonClick={handleFavoriteButtonClick}
      >
        <RecoilScope SpecificContext={TableContext}>
          <StyledTableContainer>
            <CompanyTable />
          </StyledTableContainer>
          <EntityTableActionBar>
            <TableActionBarButtonCreateActivityCompany />
            <TableActionBarButtonDeleteCompanies />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
