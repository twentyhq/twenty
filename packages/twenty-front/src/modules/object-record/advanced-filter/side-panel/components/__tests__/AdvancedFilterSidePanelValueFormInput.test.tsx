import { render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { AdvancedFilterSidePanelValueFormInput } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelValueFormInput';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: () => <div data-testid="form-field-input" />,
}));

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput',
  () => ({
    FormMultiSelectFieldInput: ({
      options,
    }: {
      options: { value: string }[];
    }) => <div data-testid="multiselect-options-count">{options.length}</div>,
  }),
);

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormWorkspaceMemberFilterValueInput',
  () => ({
    FormWorkspaceMemberFilterValueInput: () => (
      <div data-testid="workspace-member-filter-input" />
    ),
  }),
);

const INSTANCE_ID = 'advanced-filter-value-test';
const FILTER_ID = 'relation-select-filter';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

const relationField = opportunity.fields.find(
  (field) => field.type === FieldMetadataType.RELATION,
);

const selectField = opportunity.fields.find(
  (field) =>
    field.type === FieldMetadataType.SELECT && (field.options?.length ?? 0) > 0,
);

const workspaceMemberRelationField = opportunity.fields.find(
  (field) =>
    field.type === FieldMetadataType.RELATION &&
    field.relation?.targetObjectMetadata.nameSingular === 'workspaceMember',
);

const nonWorkspaceMemberRelationField = opportunity.fields.find(
  (field) =>
    field.type === FieldMetadataType.RELATION &&
    field.relation?.targetObjectMetadata.nameSingular !== 'workspaceMember',
);

if (
  !relationField ||
  !selectField ||
  !workspaceMemberRelationField ||
  !nonWorkspaceMemberRelationField
) {
  throw new Error('Missing expected fields in opportunity mock');
}

const relationToSelectFilter: RecordFilter = {
  id: FILTER_ID,
  fieldMetadataId: relationField.id,
  relationTargetFieldMetadataId: selectField.id,
  type: FieldMetadataType.SELECT,
  operand: ViewFilterOperand.IS,
  value: '',
  displayValue: '',
  label: `${relationField.label} → ${selectField.label}`,
};

const workspaceMemberRelationFilter: RecordFilter = {
  id: FILTER_ID,
  fieldMetadataId: workspaceMemberRelationField.id,
  relationTargetFieldMetadataId: null,
  type: FieldMetadataType.RELATION,
  operand: ViewFilterOperand.IS,
  value: '',
  displayValue: '',
  label: workspaceMemberRelationField.label,
};

const nonWorkspaceMemberRelationFilter: RecordFilter = {
  id: FILTER_ID,
  fieldMetadataId: nonWorkspaceMemberRelationField.id,
  relationTargetFieldMetadataId: null,
  type: FieldMetadataType.RELATION,
  operand: ViewFilterOperand.IS,
  value: '',
  displayValue: '',
  label: nonWorkspaceMemberRelationField.label,
};

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderValueInput = ({
  recordFilter,
  dropdownFieldMetadataId,
}: {
  recordFilter: RecordFilter;
  dropdownFieldMetadataId: string;
}) => {
  const Seed = ({ children }: { children: React.ReactNode }) => {
    const setCurrentRecordFilters = useSetAtomComponentState(
      currentRecordFiltersComponentState,
    );
    const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
      fieldMetadataItemIdUsedInDropdownComponentState,
      getAdvancedFilterObjectFilterDropdownComponentInstanceId(FILTER_ID),
    );

    const [isSeeded, setIsSeeded] = useState(false);

    useEffect(() => {
      setCurrentRecordFilters([recordFilter]);
      setFieldMetadataItemIdUsedInDropdown(dropdownFieldMetadataId);
      setIsSeeded(true);
    }, [setCurrentRecordFilters, setFieldMetadataItemIdUsedInDropdown]);

    return isSeeded ? <>{children}</> : null;
  };

  return render(
    <BaseWrapper>
      <AdvancedFilterContext.Provider
        value={{
          objectMetadataItem: opportunity,
          isWorkflowFindRecords: false,
        }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <ObjectFilterDropdownComponentInstanceContext.Provider
            value={{
              instanceId:
                getAdvancedFilterObjectFilterDropdownComponentInstanceId(
                  FILTER_ID,
                ),
            }}
          >
            <Seed>
              <AdvancedFilterSidePanelValueFormInput
                recordFilterId={FILTER_ID}
              />
            </Seed>
          </ObjectFilterDropdownComponentInstanceContext.Provider>
        </RecordFiltersComponentInstanceContext.Provider>
      </AdvancedFilterContext.Provider>
    </BaseWrapper>,
  );
};

describe('AdvancedFilterSidePanelValueFormInput', () => {
  it('resolves select options from the relation target field for a relation-traversal filter', async () => {
    const { getByTestId } = renderValueInput({
      recordFilter: relationToSelectFilter,
      dropdownFieldMetadataId: relationField.id,
    });

    await waitFor(() => {
      expect(getByTestId('multiselect-options-count').textContent).toBe(
        String(selectField.options?.length),
      );
    });
  });

  it('renders the workspace member "Me" picker for a direct relation-to-workspaceMember filter', async () => {
    const { getByTestId } = renderValueInput({
      recordFilter: workspaceMemberRelationFilter,
      dropdownFieldMetadataId: workspaceMemberRelationField.id,
    });

    await waitFor(() => {
      expect(getByTestId('workspace-member-filter-input')).toBeInTheDocument();
    });
  });

  it('falls through to the generic field input for a direct relation to a non-workspaceMember object', async () => {
    const { getByTestId, queryByTestId } = renderValueInput({
      recordFilter: nonWorkspaceMemberRelationFilter,
      dropdownFieldMetadataId: nonWorkspaceMemberRelationField.id,
    });

    await waitFor(() => {
      expect(getByTestId('form-field-input')).toBeInTheDocument();
    });
    expect(
      queryByTestId('workspace-member-filter-input'),
    ).not.toBeInTheDocument();
  });
});
