import { useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { TableActionBarButtonCreateActivityCompany } from '@/companies/table/components/TableActionBarButtonCreateActivityCompany';
import { TableActionBarButtonDeleteCompanies } from '@/companies/table/components/TableActionBarButtonDeleteCompanies';
import { IconBuildingSkyscraper } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { snackBarInternalState } from '@/ui/snack-bar/states/snackBarState';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

import { SEARCH_COMPANY_QUERY } from '../../modules/search/queries/search';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertOneCompanyMutation();
  const id = uuidv4();

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

  const theme = useTheme();

  const setSnackBarState = useSetRecoilState(snackBarInternalState);

  useEffect(() => {
    return () => {
      // Clear the snackbar queue when the component unmounts
      // This will subsequently cancel the deletion of items
      setSnackBarState((prevState) => ({
        ...prevState,
        queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
      }));
    };
  }, [id, setSnackBarState]);

  return (
    <>
      <WithTopBarContainer
        title="Companies"
        icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
        onAddButtonClick={handleAddButtonClick}
      >
        <RecoilScope SpecificContext={TableContext}>
          <StyledTableContainer>
            <CompanyTable />
          </StyledTableContainer>
          <EntityTableActionBar>
            <TableActionBarButtonCreateActivityCompany />
            <TableActionBarButtonDeleteCompanies id={id} />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
