/* eslint-disable @typescript-eslint/no-empty-function */
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { CompanyTable } from '@/companies/table/components/CompanyTable';
import { TableActionBarButtonCreateActivityCompany } from '@/companies/table/components/TableActionBarButtonCreateActivityCompany';
import { TableActionBarButtonDeleteCompanies } from '@/companies/table/components/TableActionBarButtonDeleteCompanies';
import { SEARCH_COMPANY_QUERY } from '@/search/queries/search';
import { ReactSpreadsheetImport } from '@/spreadsheet-import';
import { IconBuildingSkyscraper, IconUser } from '@/ui/icon';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { useUpsertEntityTableItem } from '@/ui/table/hooks/useUpsertEntityTableItem';
import { useUpsertTableRowId } from '@/ui/table/hooks/useUpsertTableRowId';
import { TableContext } from '@/ui/table/states/TableContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

const StyledTableContainer = styled.div`
  display: flex;
  width: 100%;
`;

export function Companies() {
  const [insertCompany] = useInsertOneCompanyMutation();
  const upsertEntityTableItem = useUpsertEntityTableItem();
  const upsertTableRowIds = useUpsertTableRowId();

  async function handleAddButtonClick() {
    const newCompanyId: string = v4();
    await insertCompany({
      variables: {
        data: {
          id: newCompanyId,
          name: '',
          domainName: '',
          address: '',
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        createOneCompany: {
          __typename: 'Company',
          id: newCompanyId,
          name: '',
          domainName: '',
          address: '',
          createdAt: new Date().toISOString(),
          accountOwner: null,
          linkedinUrl: '',
          employees: null,
        },
      },
      update: (cache, { data }) => {
        if (data?.createOneCompany) {
          upsertTableRowIds(data?.createOneCompany.id);
          upsertEntityTableItem(data?.createOneCompany);
        }
      },
      refetchQueries: [getOperationName(SEARCH_COMPANY_QUERY) ?? ''],
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
            <TableActionBarButtonCreateActivityCompany />
            <TableActionBarButtonDeleteCompanies />
          </EntityTableActionBar>
        </RecoilScope>
      </WithTopBarContainer>
      <ReactSpreadsheetImport
        isOpen={true}
        onSubmit={() => {}}
        onClose={() => {}}
        fields={[
          {
            icon: <IconUser />,
            // Visible in table header and when matching columns.
            label: 'Firstname',
            // This is the key used for this field when we call onSubmit.
            key: 'firstname',
            // Allows for better automatic column matching. Optional.
            alternateMatches: ['first name', 'first'],
            // Used when editing and validating information.
            fieldType: {
              // There are 3 types - "input" / "checkbox" / "select".
              type: 'input',
            },
            // Used in the first step to provide an example of what data is expected in this field. Optional.
            example: 'Michel',
            // Can have multiple validations that are visible in Validation Step table.
            validations: [
              {
                // Can be "required" / "unique" / "regex"
                rule: 'required',
                errorMessage: 'Firstname is required',
                // There can be "info" / "warning" / "error" levels. Optional. Default "error".
                level: 'error',
              },
            ],
          },
          {
            icon: <IconUser />,
            // Visible in table header and when matching columns.
            label: 'Lastname',
            // This is the key used for this field when we call onSubmit.
            key: 'lastname',
            // Allows for better automatic column matching. Optional.
            alternateMatches: ['last name', 'last'],
            // Used when editing and validating information.
            fieldType: {
              // There are 3 types - "input" / "checkbox" / "select".
              type: 'checkbox',
            },
            // Used in the first step to provide an example of what data is expected in this field. Optional.
            example: 'Jean',
            // Can have multiple validations that are visible in Validation Step table.
            validations: [
              {
                // Can be "required" / "unique" / "regex"
                rule: 'required',
                errorMessage: 'Lastname is required',
                // There can be "info" / "warning" / "error" levels. Optional. Default "error".
                level: 'error',
              },
            ],
          },
          {
            icon: <IconUser />,
            // Visible in table header and when matching columns.
            label: 'Test',
            // This is the key used for this field when we call onSubmit.
            key: 'test',
            // Allows for better automatic column matching. Optional.
            alternateMatches: ['test'],
            // Used when editing and validating information.
            fieldType: {
              // There are 3 types - "input" / "checkbox" / "select".
              type: 'select',
              options: [{ label: 'Test', value: 'test' }],
            },
            // Used in the first step to provide an example of what data is expected in this field. Optional.
            example: 'Test',
            // Can have multiple validations that are visible in Validation Step table.
            validations: [
              {
                // Can be "required" / "unique" / "regex"
                rule: 'required',
                errorMessage: 'Test is required',
                // There can be "info" / "warning" / "error" levels. Optional. Default "error".
                level: 'error',
              },
            ],
          },
        ]}
      />
    </>
  );
}
