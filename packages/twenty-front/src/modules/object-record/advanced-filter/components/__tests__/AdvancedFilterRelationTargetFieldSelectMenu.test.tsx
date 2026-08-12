import { fireEvent, render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { AdvancedFilterRelationTargetFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterRelationTargetFieldSelectMenu';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const INSTANCE_ID = 'advanced-filter-relation-target-test';
const FILTER_ID = 'relation-target-filter';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

const workspaceMemberRelationField = opportunity.fields.find(
  (field) =>
    isManyToOneRelationField(field) &&
    field.relation.targetObjectMetadata.nameSingular === 'workspaceMember',
);

const nonWorkspaceMemberRelationField = opportunity.fields.find(
  (field) =>
    isManyToOneRelationField(field) &&
    field.relation.targetObjectMetadata.nameSingular !== 'workspaceMember',
);

const oneToManyRelationField = opportunity.fields.find((field) =>
  isOneToManyRelationField(field),
);

if (
  !workspaceMemberRelationField ||
  !nonWorkspaceMemberRelationField ||
  !oneToManyRelationField
) {
  throw new Error('Missing expected relation fields in opportunity mock');
}

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const CurrentRecordFiltersObserver = () => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  return (
    <div data-testid="current-record-filters">
      {JSON.stringify(currentRecordFilters)}
    </div>
  );
};

const Seed = ({
  sourceFieldMetadataId,
  children,
}: {
  sourceFieldMetadataId: string;
  children: React.ReactNode;
}) => {
  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    setFieldMetadataItemIdUsedInDropdown(sourceFieldMetadataId);
    setIsSeeded(true);
  }, [sourceFieldMetadataId, setFieldMetadataItemIdUsedInDropdown]);

  return isSeeded ? <>{children}</> : null;
};

const renderSubMenu = (sourceFieldMetadataId: string) => {
  return render(
    <BaseWrapper>
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <Seed sourceFieldMetadataId={sourceFieldMetadataId}>
            <AdvancedFilterRelationTargetFieldSelectMenu
              recordFilterId={FILTER_ID}
            />
          </Seed>
          <CurrentRecordFiltersObserver />
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </BaseWrapper>,
  );
};

describe('AdvancedFilterRelationTargetFieldSelectMenu', () => {
  it('shows a "filter by record" entry when the relation target is workspaceMember', async () => {
    const { getByTestId } = renderSubMenu(workspaceMemberRelationField.id);

    await waitFor(() => {
      expect(getByTestId('select-filter-relation-record')).toBeInTheDocument();
    });
  });

  it('shows the "filter by record" entry for any relation target', async () => {
    const { getByTestId } = renderSubMenu(nonWorkspaceMemberRelationField.id);

    await waitFor(() => {
      expect(getByTestId('select-filter-relation-record')).toBeInTheDocument();
    });
  });

  it('shows relation target choices for a one-to-many source field', async () => {
    const { getByTestId } = renderSubMenu(oneToManyRelationField.id);

    await waitFor(() => {
      expect(getByTestId('select-filter-relation-record')).toBeInTheDocument();
    });
  });

  it('creates a direct RELATION filter (relationTargetFieldMetadataId null) when the record entry is selected', async () => {
    const { getByTestId } = renderSubMenu(workspaceMemberRelationField.id);

    const recordEntry = await waitFor(() =>
      getByTestId('select-filter-relation-record'),
    );

    fireEvent.click(recordEntry);

    await waitFor(() => {
      const currentRecordFilters = JSON.parse(
        getByTestId('current-record-filters').textContent || '[]',
      );

      expect(currentRecordFilters).toHaveLength(1);
      expect(currentRecordFilters[0]).toMatchObject({
        fieldMetadataId: workspaceMemberRelationField.id,
        type: 'RELATION',
        relationTargetFieldMetadataId: null,
      });
    });
  });
});
