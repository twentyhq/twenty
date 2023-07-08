import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { isMockModeState } from '@/auth/states/isMockModeState';
import { GET_COMPANIES } from '@/companies/services';
import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';
import {
  InsertCompanyMutationVariables,
  useInsertCompanyMutation,
} from '~/generated/graphql';

import { TableActionBarButtonCreateCommentThreadCompany } from './table/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';
import { CompanyTable } from './CompanyTable';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [isMockMode] = useRecoilState(isMockModeState);

  const hotkeysEnabled = !isMockMode;

  useHotkeysScopeOnMountOnly(
    {
      scope: InternalHotkeysScope.Table,
      customScopes: { 'command-menu': true, goto: true },
    },
    hotkeysEnabled,
  );

  const [insertCompany] = useInsertCompanyMutation();

  async function handleAddButtonClick() {
    const newCompany: InsertCompanyMutationVariables = {
      id: uuidv4(),
      name: '',
      domainName: '',
      employees: null,
      address: '',
      createdAt: new Date().toISOString(),
    };

    await insertCompany({
      variables: newCompany,
      refetchQueries: [getOperationName(GET_COMPANIES) ?? ''],
    });
  }

  const theme = useTheme();

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
            <TableActionBarButtonCreateCommentThreadCompany />
            <TableActionBarButtonDeleteCompanies />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
    </>
  );
}
