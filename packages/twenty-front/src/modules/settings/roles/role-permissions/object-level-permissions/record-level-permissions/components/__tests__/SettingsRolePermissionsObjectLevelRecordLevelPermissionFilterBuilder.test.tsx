import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockHandleAddFilterGroup = jest.fn();

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
      handleAddFilterGroup: mockHandleAddFilterGroup,
    }),
  }),
);

jest.mock('@/command-menu/components/CommandMenuButton', () => ({
  CommandMenuButton: ({
    command,
    onClick,
  }: {
    command: { label: string };
    onClick?: () => void;
  }) => <button onClick={() => onClick?.()}>{command.label}</button>,
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

const buildGroup = ({
  id,
  logicalOperator,
  parentRowLevelPermissionPredicateGroupId = null,
  positionInRowLevelPermissionPredicateGroup = null,
}: {
  id: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  parentRowLevelPermissionPredicateGroupId?: string | null;
  positionInRowLevelPermissionPredicateGroup?: number | null;
}): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id,
  parentRowLevelPermissionPredicateGroupId,
  logicalOperator,
  positionInRowLevelPermissionPredicateGroup,
  roleId: ROLE_ID,
  objectMetadataId: OBJECT_METADATA_ITEM.id,
});

const OR_GROUP = buildGroup({
  id: OR_GROUP_ID,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
});

const ROOT_AND_GROUP = buildGroup({
  id: 'root-and-group',
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
});

const NESTED_OR_GROUP = buildGroup({
  id: 'nested-or-group',
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
  parentRowLevelPermissionPredicateGroupId: ROOT_AND_GROUP.id,
  positionInRowLevelPermissionPredicateGroup: 0,
});

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

  it('shows predicates inside a nested group and keeps the group in the draft', async () => {
    const { getDraftRole } = renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('mine', NESTED_OR_GROUP.id),
        buildPredicate('small-deals', NESTED_OR_GROUP.id),
        {
          ...buildPredicate('not-lost', ROOT_AND_GROUP.id),
          positionInRowLevelPermissionPredicateGroup: 1,
        },
      ],
      rowLevelPermissionPredicateGroups: [ROOT_AND_GROUP, NESTED_OR_GROUP],
    });

    expect(await screen.findByText('mine in OR')).toBeInTheDocument();
    expect(screen.getByText('small-deals in OR')).toBeInTheDocument();
    expect(screen.getByText('not-lost in AND')).toBeInTheDocument();

    await waitFor(() => {
      expect(getDraftRole().rowLevelPermissionPredicateGroups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: NESTED_OR_GROUP.id,
            parentRowLevelPermissionPredicateGroupId: ROOT_AND_GROUP.id,
          }),
        ]),
      );
    });
  });

  it('shows predicates in a group nested two levels below a root with no direct predicate', async () => {
    const middleGroup = buildGroup({
      id: 'middle-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      parentRowLevelPermissionPredicateGroupId: OR_GROUP_ID,
    });
    const deepGroup = buildGroup({
      id: 'deep-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      parentRowLevelPermissionPredicateGroupId: middleGroup.id,
    });

    renderBuilder({
      rowLevelPermissionPredicates: [buildPredicate('deep', deepGroup.id)],
      rowLevelPermissionPredicateGroups: [OR_GROUP, middleGroup, deepGroup],
    });

    expect(await screen.findByText('deep in AND')).toBeInTheDocument();
  });

  it('removes a nested group with its predicates and subgroups', async () => {
    const innerGroup = buildGroup({
      id: 'inner-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      parentRowLevelPermissionPredicateGroupId: NESTED_OR_GROUP.id,
    });

    const { getDraftRole } = renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('mine', NESTED_OR_GROUP.id),
        buildPredicate('inner', innerGroup.id),
        {
          ...buildPredicate('not-lost', ROOT_AND_GROUP.id),
          positionInRowLevelPermissionPredicateGroup: 1,
        },
      ],
      rowLevelPermissionPredicateGroups: [
        ROOT_AND_GROUP,
        NESTED_OR_GROUP,
        innerGroup,
      ],
    });

    const [, nestedGroupOptions] = await screen.findAllByLabelText(
      'Filter group rule options',
    );
    await userEvent.click(nestedGroupOptions);
    await userEvent.click(await screen.findByText('Remove rule group'));

    expect(screen.queryByText('mine in OR')).not.toBeInTheDocument();
    expect(screen.queryByText('inner in AND')).not.toBeInTheDocument();
    expect(screen.getByText('not-lost in AND')).toBeInTheDocument();

    await waitFor(() => {
      const draftRole = getDraftRole();

      expect(
        (draftRole.rowLevelPermissionPredicates ?? []).map(({ id }) => id),
      ).toEqual(['not-lost']);
      expect(
        (draftRole.rowLevelPermissionPredicateGroups ?? []).map(({ id }) => id),
      ).toEqual([ROOT_AND_GROUP.id]);
    });
  });

  it('keeps the groups of a relation-backed predicate when removing its group', async () => {
    const { getDraftRole } = renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('mine', NESTED_OR_GROUP.id),
        {
          ...buildPredicate('via-company', NESTED_OR_GROUP.id),
          relationFieldMetadataId: 'company-relation-field-id',
        },
      ],
      rowLevelPermissionPredicateGroups: [ROOT_AND_GROUP, NESTED_OR_GROUP],
    });

    await userEvent.click(
      await screen.findByLabelText('Filter group rule options'),
    );
    await userEvent.click(await screen.findByText('Remove rule group'));

    expect(screen.queryByText('mine in OR')).not.toBeInTheDocument();

    await waitFor(() => {
      const draftRole = getDraftRole();

      expect(
        (draftRole.rowLevelPermissionPredicates ?? []).map(({ id }) => id),
      ).toEqual(['via-company']);
      expect(
        (draftRole.rowLevelPermissionPredicateGroups ?? [])
          .map(({ id }) => id)
          .sort(),
      ).toEqual([NESTED_OR_GROUP.id, ROOT_AND_GROUP.id].sort());
    });
  });

  it('hides a nested group that holds no editable predicate', async () => {
    const emptyGroup = buildGroup({
      id: 'empty-group',
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      parentRowLevelPermissionPredicateGroupId: ROOT_AND_GROUP.id,
    });

    renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('not-lost', ROOT_AND_GROUP.id),
      ],
      rowLevelPermissionPredicateGroups: [ROOT_AND_GROUP, emptyGroup],
    });

    expect(await screen.findByText('not-lost in AND')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Filter group rule options'),
    ).not.toBeInTheDocument();
  });

  it('adds a rule group to the root group', async () => {
    renderBuilder({
      rowLevelPermissionPredicates: [
        buildPredicate('not-lost', ROOT_AND_GROUP.id),
      ],
      rowLevelPermissionPredicateGroups: [ROOT_AND_GROUP],
    });

    await userEvent.click(await screen.findByText('Add rule group'));

    expect(mockHandleAddFilterGroup).toHaveBeenCalledTimes(1);
    expect(mockHandleAddFilterGroup).toHaveBeenCalledWith(
      expect.objectContaining({ id: ROOT_AND_GROUP.id }),
    );
  });
});
