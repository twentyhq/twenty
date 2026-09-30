import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const INSTANCE_ID = 'record-permission-filter-story';
const FILTER_ID = 'record-permission-filter';
const ROW_INSTANCE_ID =
  getAdvancedFilterObjectFilterDropdownComponentInstanceId(FILTER_ID);
const FILTER_GROUP = {
  id: 'record-permission-filter-group',
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
};
const filtersState = currentRecordFiltersComponentState.atomFamily({
  instanceId: INSTANCE_ID,
});

const StyledContainer = styled.div`
  width: 720px;
`;

const PermissionFilterStory = () => {
  const store = useStore();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'company',
  });
  const field = objectMetadataItem.fields.find(
    (candidate) => candidate.name === 'name',
  );
  const filters = useAtomValue(filtersState);

  useEffect(() => {
    if (!isDefined(field)) {
      return;
    }

    const filter: RecordFilter = {
      id: FILTER_ID,
      fieldMetadataId: field.id,
      type: getFilterTypeFromFieldType(field.type),
      label: field.label,
      operand: ViewFilterOperand.IS,
      value: '',
      displayValue: '',
      recordFilterGroupId: FILTER_GROUP.id,
      positionInRecordFilterGroup: 0,
    };
    store.set(filtersState, [filter]);
    store.set(
      currentRecordFilterGroupsComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      [FILTER_GROUP],
    );
    store.set(
      fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
        instanceId: ROW_INSTANCE_ID,
      }),
      field.id,
    );
    store.set(
      objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
        instanceId: ROW_INSTANCE_ID,
      }),
      filter,
    );

    return () => store.set(filtersState, []);
  }, [field, store]);

  const filter = filters[0];

  if (!isDefined(filter)) {
    return null;
  }

  return (
    <RecordFiltersComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
          <StyledContainer
            onKeyDown={(event) => {
              if (event.key === 'F2') {
                event.preventDefault();
                store.set(filtersState, [
                  { ...filter, value: 'Updated while open' },
                ]);
              }
            }}
          >
            <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow
              recordFilter={filter}
              recordFilterGroup={FILTER_GROUP}
              index={0}
            />
          </StyledContainer>
        </AdvancedFilterContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </RecordFiltersComponentInstanceContext.Provider>
  );
};

const meta = {
  title: 'Settings/Roles/RecordLevelPermissionFilterRow',
  component: PermissionFilterStory,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { msw: graphqlMocks },
} satisfies Meta<typeof PermissionFilterStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompositeFieldPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByRole('button', { name: 'Name' }));
    const dialog = await body.findByRole('dialog', {
      name: 'Select a filter field',
    });
    const dropdown = within(dialog);
    expect(
      dropdown.queryByRole('button', { name: 'ID' }),
    ).not.toBeInTheDocument();
    await userEvent.click(dropdown.getByRole('button', { name: 'Address' }));
    expect(await dropdown.findByRole('button', { name: 'City' })).toBeVisible();
    await userEvent.click(dropdown.getByRole('button', { name: 'Address' }));
    expect(
      await dropdown.findByRole('searchbox', { name: 'Search fields' }),
    ).toHaveFocus();
    await userEvent.click(dropdown.getByRole('button', { name: 'Address' }));
    await userEvent.click(
      await dropdown.findByRole('button', { name: 'City' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(await canvas.findByText('Address / City')).toBeVisible();
  },
};

export const MePickerSurvivesRerender: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Select a current user field',
    });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Select 1 text field',
    });
    const dropdown = within(dialog);
    const search = dropdown.getByRole('searchbox');
    await userEvent.type(search, 'Name');
    await userEvent.keyboard('{F2}');
    expect(search).toBeInTheDocument();
    expect(search).toHaveValue('Name');
    expect(search).toHaveFocus();
    await userEvent.clear(search);
    await userEvent.type(search, 'no-compatible-field');
    expect(await dropdown.findByText('No compatible fields')).toBeVisible();
    await userEvent.click(dropdown.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await userEvent.click(trigger);
    const reopened = within(
      await body.findByRole('dialog', { name: 'Select 1 text field' }),
    );
    expect(reopened.getByRole('searchbox')).toHaveValue('');
    await userEvent.click(
      reopened.getByRole('button', { name: 'Name / First Name' }),
    );
    expect(await canvas.findByText('Me')).toBeVisible();
    expect(await canvas.findByText('/ Name / First Name')).toBeVisible();
  },
};
