import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';

import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: () => <div data-testid="form-field-input" />,
}));

const INSTANCE_ID = 'advanced-filter-side-panel-container-test';
const ROOT_GROUP_ID = 'root-group-id';

const company = getMockObjectMetadataItemOrThrow('company');

const filterOnDeletedField: PersistedRecordFilter = {
  id: 'filter-on-deleted-field',
  fieldMetadataId: 'deleted-field-id',
  operand: ViewFilterOperand.CONTAINS,
  value: '{{trigger.name}}',
  recordFilterGroupId: ROOT_GROUP_ID,
  positionInRecordFilterGroup: 0,
};

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const Seed = ({ children }: { children: React.ReactNode }) => {
  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );
  const setUnresolvedRecordFilters = useSetAtomComponentState(
    unresolvedRecordFiltersComponentState,
  );

  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setCurrentRecordFilterGroups([
      {
        id: ROOT_GROUP_ID,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ]);
    setUnresolvedRecordFilters([filterOnDeletedField]);
    setIsSeeded(true);
  }, [setCurrentRecordFilterGroups, setUnresolvedRecordFilters]);

  return isSeeded ? <>{children}</> : null;
};

const renderContainer = ({
  onUpdate,
  readonly,
}: {
  onUpdate: () => void;
  readonly?: boolean;
}) =>
  render(
    <BaseWrapper>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <Seed>
            <AdvancedFilterSidePanelContainer
              objectMetadataItem={company}
              onUpdate={onUpdate}
              readonly={readonly}
            />
          </Seed>
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </BaseWrapper>,
  );

describe('AdvancedFilterSidePanelContainer', () => {
  it('shows a filter on a deleted field as a rule that can be removed', async () => {
    const onUpdate = jest.fn();

    renderContainer({ onUpdate });

    expect(
      await screen.findByText('Field no longer exists'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Record filter rule options' }),
    );
    await userEvent.click(await screen.findByText('Remove rule'));

    await waitFor(() => {
      expect(
        screen.queryByText('Field no longer exists'),
      ).not.toBeInTheDocument();
    });
    expect(onUpdate).toHaveBeenCalled();
  });

  it('does not offer to remove a filter on a deleted field when read only', async () => {
    renderContainer({ onUpdate: jest.fn(), readonly: true });

    expect(
      await screen.findByText('Field no longer exists'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Record filter rule options' }),
    ).not.toBeInTheDocument();
  });
});
