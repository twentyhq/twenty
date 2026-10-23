import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SettingsRolePermissionsObjectLevelRecordLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const ROLE_ID = 'record-level-section-role-id';
const PREDICATE_GROUP_ID = 'record-level-section-predicate-group-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const companyNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const DRAFT_ROLE_WITH_RULES: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: ROLE_ID,
  label: 'Sales',
  rowLevelPermissionPredicates: [
    {
      __typename: 'RowLevelPermissionPredicate',
      id: 'record-level-section-predicate-id',
      roleId: ROLE_ID,
      objectMetadataId: companyObjectMetadataItem.id,
      fieldMetadataId: companyNameField.id,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: 'Acme',
      subFieldName: null,
      workspaceMemberFieldMetadataId: null,
      workspaceMemberSubFieldName: null,
      rowLevelPermissionPredicateGroupId: PREDICATE_GROUP_ID,
      positionInRowLevelPermissionPredicateGroup: 0,
    },
  ],
  rowLevelPermissionPredicateGroups: [
    {
      __typename: 'RowLevelPermissionPredicateGroup',
      id: PREDICATE_GROUP_ID,
      roleId: ROLE_ID,
      objectMetadataId: companyObjectMetadataItem.id,
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      parentRowLevelPermissionPredicateGroupId: null,
      positionInRowLevelPermissionPredicateGroup: 0,
    },
  ],
};

const meta = {
  title: 'Settings/Roles/RecordLevelSection',
  component: SettingsRolePermissionsObjectLevelRecordLevelSection,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: {
    objectMetadataItem: companyObjectMetadataItem,
    roleId: ROLE_ID,
    hasOrganizationPlan: false,
    isCurrentWorkspaceMemberAdmin: false,
  },
  beforeEach: () => {
    jotaiStore.set(
      settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
      DRAFT_ROLE_WITH_RULES,
    );
  },
} satisfies Meta<typeof SettingsRolePermissionsObjectLevelRecordLevelSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Entitled: Story = {
  args: { hasOrganizationPlan: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Add rule' }),
    ).toBeVisible();
    expect(
      canvas.getByText(
        'Ability to filter the records a user can interact with.',
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Remove rules' }),
    ).not.toBeInTheDocument();
  },
};

export const NotEntitledWithoutRules: Story = {
  beforeEach: () => {
    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), {
      ...DRAFT_ROLE_WITH_RULES,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Upgrade to access')).toBeVisible();
    expect(
      canvas.queryByText('These rules still apply. Upgrade to edit them.'),
    ).not.toBeInTheDocument();
  },
};

export const NotEntitledWithRulesAsAdmin: Story = {
  args: { isCurrentWorkspaceMemberAdmin: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      await canvas.findByText('These rules still apply. Upgrade to edit them.'),
    ).toBeVisible();
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Add rule' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove rules' }));

    const dialog = await body.findByRole('dialog', {
      name: 'Remove record-level rules',
    });

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Remove' }),
    );

    expect(await canvas.findByText('Upgrade to access')).toBeVisible();
  },
};

export const NotEntitledWithRulesAsNonAdmin: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('These rules still apply. Upgrade to edit them.'),
    ).toBeVisible();
    expect(await canvas.findByText('Name')).toBeVisible();
    expect(
      canvas.getByText('Only Admins can remove these rules.'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Remove rules' }),
    ).not.toBeInTheDocument();
  },
};
