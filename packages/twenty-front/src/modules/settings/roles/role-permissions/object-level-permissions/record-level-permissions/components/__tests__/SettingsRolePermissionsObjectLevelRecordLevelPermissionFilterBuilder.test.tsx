import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const ROLE_ID = 'role-id';
const OBJECT_METADATA_ITEM = getMockObjectMetadataItemOrThrow('company');
const FIELD_METADATA_ID = 'field-metadata-id';
const OR_GROUP_ID = 'or-group-id';

jest.mock(
  '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems',
  () => ({
    useFilterableFieldMetadataItems: () => ({
      filterableFieldMetadataItems: [
        { id: 'field-metadata-id', label: 'Owner', type: 'RELATION' },
      ],
    }),
  }),
);

jest.mock(
  '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions',
  () => ({
    useRecordLevelPermissionFilterActions: () => ({
      handleCreateFirstFilter: jest.fn(),
      handleAddFilter: jest.fn(),
    }),
  }),
);

jest.mock('@/command-menu/components/CommandMenuButton', () => ({
  CommandMenuButton: () => <button>Add rule</button>,
}));

jest.mock(
  '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow',
  () => ({
    SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow: ({
      recordFilter,
      recordFilterGroup,
    }: {
      recordFilter: RecordFilter;
      recordFilterGroup?: RecordFilterGroup;
    }) => (
      <div>
        {`${recordFilter.id} in ${recordFilterGroup?.logicalOperator ?? 'no group'}`}
      </div>
    ),
  }),
);

const buildPredicate = (
  id: string,
  rowLevelPermissionPredicateGroupId: string | null,
): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: FIELD_METADATA_ID,
  objectMetadataId: OBJECT_METADATA_ITEM.id,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  rowLevelPermissionPredicateGroupId,
  positionInRowLevelPermissionPredicateGroup: null,
  roleId: ROLE_ID,
  workspaceMemberFieldMetadataId: 'workspace-member-id-field',
  workspaceMemberSubFieldName: null,
});

const OR_GROUP: RowLevelPermissionPredicateGroup = {
  __typename: 'RowLevelPermissionPredicateGroup',
  id: OR_GROUP_ID,
  parentRowLevelPermissionPredicateGroupId: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
  positionInRowLevelPermissionPredicateGroup: null,
  roleId: ROLE_ID,
  objectMetadataId: OBJECT_METADATA_ITEM.id,
};

const renderBuilder = ({
  rowLevelPermissionPredicates,
  rowLevelPermissionPredicateGroups,
}: {
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
}) => {
  const draftRole: RoleWithPartialMembers = {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    id: ROLE_ID,
    rowLevelPermissionPredicates,
    rowLevelPermissionPredicateGroups,
  };

  const store = createStore();
  const draftRoleAtom = settingsDraftRoleFamilyState.getAtom(ROLE_ID, null);
  store.set(draftRoleAtom, draftRole);

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
          roleId={ROLE_ID}
          objectMetadataItem={OBJECT_METADATA_ITEM}
        />
      </JotaiProvider>
    </I18nProvider>,
  );

  return { getDraftRole: () => store.get(draftRoleAtom) };
};

describe('SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder', () => {
  beforeAll(() => {
    i18n.loadAndActivate({ locale: 'en', messages: {} });
  });

  it('shows ungrouped predicates when the object has no root group', async () => {
    renderBuilder({
      rowLevelPermissionPredicates: [buildPredicate('ungrouped', null)],
      rowLevelPermissionPredicateGroups: [],
    });

    expect(
      await screen.findByText('ungrouped in no group'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Add filter')).toBeInTheDocument();
  });

  it('keeps ungrouped predicates out of an OR root group', async () => {
    const { getDraftRole } = renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('ungrouped', null),
        buildPredicate('grouped', OR_GROUP_ID),
      ],
      rowLevelPermissionPredicateGroups: [OR_GROUP],
    });

    expect(
      await screen.findByText('ungrouped in no group'),
    ).toBeInTheDocument();
    expect(screen.getByText('grouped in OR')).toBeInTheDocument();
    expect(screen.getByText('And')).toBeInTheDocument();

    await waitFor(() => {
      const predicates = getDraftRole().rowLevelPermissionPredicates ?? [];

      expect(
        predicates.find(({ id }) => id === 'ungrouped')
          ?.rowLevelPermissionPredicateGroupId,
      ).toBeNull();
    });
  });
});
