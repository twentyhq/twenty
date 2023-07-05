import { useCallback, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { queuedActionsState } from '@/command-menu/states/queuedActionsState';
import { useCreateCompany } from '@/companies/hooks/useCreateCompany';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { EntityTableActionBar } from '@/ui/components/table/action-bar/EntityTableActionBar';
import { IconBuildingSkyscraper } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { TableContext } from '@/ui/tables/states/TableContext';

import { TableActionBarButtonCreateCommentThreadCompany } from './table/TableActionBarButtonCreateCommentThreadCompany';
import { TableActionBarButtonDeleteCompanies } from './table/TableActionBarButtonDeleteCompanies';
import { CompanyTable } from './CompanyTable';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [queuedActions, setQueuedActions] = useRecoilState(queuedActionsState);
  const createCompany = useCreateCompany();

  const handleAddButtonClick = useCallback(async () => {
    await createCompany();
  }, [createCompany]);

  useEffect(() => {
    const actionIndex = queuedActions.findIndex(
      (action) => action.action === 'companies/create_company',
    );
    if (actionIndex !== -1) {
      handleAddButtonClick();
      setQueuedActions(
        queuedActions.filter((_, index) => index !== actionIndex),
      );
    }
  }, [queuedActions, handleAddButtonClick, setQueuedActions]);

  const theme = useTheme();

  return (
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
  );
}
