import { render } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { AdvancedFilterValueInputDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterValueInputDropdownButtonClickableSelect';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INSTANCE_ID = 'advanced-filter-clickable-select-test';
const FILTER_ID = 'assignee-me-filter';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

const workspaceMemberRelationField = opportunity.fields.find(
  (field) =>
    isManyToOneRelationField(field) &&
    field.relation.targetObjectMetadata.nameSingular === 'workspaceMember',
);

if (!workspaceMemberRelationField) {
  throw new Error('Missing workspaceMember relation field in opportunity mock');
}

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Seed = ({
  recordFilter,
  children,
}: {
  recordFilter: RecordFilter;
  children: React.ReactNode;
}) => {
  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setCurrentRecordFilters([recordFilter]);
    setIsSeeded(true);
  }, [recordFilter, setCurrentRecordFilters]);

  return isSeeded ? <>{children}</> : null;
};

const renderClickableSelect = (recordFilter: RecordFilter) => {
  return render(
    <BaseWrapper>
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <Seed recordFilter={recordFilter}>
            <AdvancedFilterValueInputDropdownButtonClickableSelect
              recordFilterId={FILTER_ID}
            />
          </Seed>
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </BaseWrapper>,
  );
};

const buildRelationFilter = (
  overrides: Partial<RecordFilter> = {},
): RecordFilter => ({
  id: FILTER_ID,
  fieldMetadataId: workspaceMemberRelationField.id,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
  displayValue: '',
  type: 'RELATION',
  operand: 'is',
  label: workspaceMemberRelationField.label,
  ...overrides,
});

describe('AdvancedFilterValueInputDropdownButtonClickableSelect', () => {
  it('renders the "Me" chip for a current-workspace-member relation filter with no stored displayValue', async () => {
    const { findByText, queryByText } = renderClickableSelect(
      buildRelationFilter(),
    );

    expect(await findByText('Me')).toBeInTheDocument();
    expect(
      queryByText(/isCurrentWorkspaceMemberSelected/),
    ).not.toBeInTheDocument();
  });
});
