import { render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { AdvancedFilterRelationTargetFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterRelationTargetFieldSelectMenu';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
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

if (!workspaceMemberRelationField || !nonWorkspaceMemberRelationField) {
  throw new Error('Missing expected relation fields in opportunity mock');
}

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderSubMenu = (sourceFieldMetadataId: string) => {
  const Seed = ({ children }: { children: React.ReactNode }) => {
    const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
      fieldMetadataItemIdUsedInDropdownComponentState,
    );

    const [isSeeded, setIsSeeded] = useState(false);

    useEffect(() => {
      setFieldMetadataItemIdUsedInDropdown(sourceFieldMetadataId);
      setIsSeeded(true);
    }, [setFieldMetadataItemIdUsedInDropdown]);

    return isSeeded ? <>{children}</> : null;
  };

  return render(
    <BaseWrapper>
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <Seed>
            <AdvancedFilterRelationTargetFieldSelectMenu
              recordFilterId={FILTER_ID}
            />
          </Seed>
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

  it('does not show the "filter by record" entry for a non-workspaceMember relation', async () => {
    const { findByText, queryByTestId } = renderSubMenu(
      nonWorkspaceMemberRelationField.id,
    );

    await findByText(nonWorkspaceMemberRelationField.label);

    expect(
      queryByTestId('select-filter-relation-record'),
    ).not.toBeInTheDocument();
  });
});
