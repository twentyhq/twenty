import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ADMIN_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  BillingEntitlementKey,
  type ObjectPermission,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const ROLE_ID = 'object-level-section-role-id';
const PREDICATE_GROUP_ID = 'object-level-section-predicate-group-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const companyNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const COMPANY_PREDICATE: RowLevelPermissionPredicate = {
  __typename: 'RowLevelPermissionPredicate',
  id: 'object-level-section-predicate-id',
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
};

const COMPANY_PREDICATE_GROUP: RowLevelPermissionPredicateGroup = {
  __typename: 'RowLevelPermissionPredicateGroup',
  id: PREDICATE_GROUP_ID,
  roleId: ROLE_ID,
  objectMetadataId: companyObjectMetadataItem.id,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: 0,
};

const COMPANY_READ_OBJECT_PERMISSION: ObjectPermission = {
  objectMetadataId: companyObjectMetadataItem.id,
  canReadObjectRecords: true,
};

const DRAFT_ROLE_WITH_RECORD_LEVEL_RULES_ONLY: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: ROLE_ID,
  label: 'Sales',
  isEditable: true,
  rowLevelPermissionPredicates: [COMPANY_PREDICATE],
  rowLevelPermissionPredicateGroups: [COMPANY_PREDICATE_GROUP],
};

const WORKSPACE_WITH_RECORD_LEVEL_PERMISSION_ENTITLEMENT = {
  ...mockCurrentWorkspace,
  billingEntitlements: [{ key: BillingEntitlementKey.RLS, value: true }],
};

const [mockedAdminRole] = mockedRoles;

const ADMIN_ROLE_WITH_CURRENT_WORKSPACE_MEMBER: RoleWithPartialMembers = {
  ...mockedAdminRole,
  universalIdentifier: ADMIN_ROLE_UNIVERSAL_IDENTIFIER,
  workspaceMembers: [
    ...mockedAdminRole.workspaceMembers,
    {
      ...mockedAdminRole.workspaceMembers[0],
      id: mockedWorkspaceMemberRecords[0].id,
    },
  ],
};

const meta = {
  title: 'Settings/Roles/ObjectLevelSection',
  component: SettingsRolePermissionsObjectLevelSection,
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    MemoryRouterDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: {
    roleId: ROLE_ID,
    isEditable: true,
  },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(
      settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
      DRAFT_ROLE_WITH_RECORD_LEVEL_RULES_ONLY,
    );
  },
} satisfies Meta<typeof SettingsRolePermissionsObjectLevelSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const openObjectPermissionOptions = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    await within(canvasElement).findByRole('button', {
      name: 'Object permission options',
    }),
  );

  return within(canvasElement.ownerDocument.body).findByRole('menuitem', {
    name: 'Edit',
  });
};

const expectRemoveRuleToClearRecordLevelRules = async (
  canvasElement: HTMLElement,
) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);

  expect(
    await canvas.findByRole('img', { name: 'Record-level rules' }),
  ).toBeVisible();

  await openObjectPermissionOptions(canvasElement);
  await userEvent.click(
    await body.findByRole('menuitem', { name: 'Remove rule' }),
  );

  expect(
    await canvas.findByText(
      'No permissions have been set for individual objects.',
    ),
  ).toBeVisible();
  expect(canvas.queryByText('Companies')).not.toBeInTheDocument();
};

export const RecordLevelRulesOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Companies')).toBeVisible();

    await userEvent.hover(
      canvas.getByRole('img', { name: 'Record-level rules' }),
    );

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      {},
      { timeout: 2000 },
    );

    await waitFor(() =>
      expect(tooltip).toHaveTextContent('Record-level rules'),
    );
  },
};

export const PredicateGroupsWithoutPredicates: Story = {
  beforeEach: () => {
    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), {
      ...DRAFT_ROLE_WITH_RECORD_LEVEL_RULES_ONLY,
      objectPermissions: [COMPANY_READ_OBJECT_PERMISSION],
      rowLevelPermissionPredicates: [],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Companies')).toBeVisible();
    expect(
      canvas.queryByRole('img', { name: 'Record-level rules' }),
    ).not.toBeInTheDocument();
  },
};

export const RemoveRuleHiddenWhenNotAllowed: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    expect(await openObjectPermissionOptions(canvasElement)).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: 'Remove rule' }),
    ).not.toBeInTheDocument();
  },
};

export const RemoveRuleKeepsRecordLevelRulesWhenNotAllowed: Story = {
  beforeEach: () => {
    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), {
      ...DRAFT_ROLE_WITH_RECORD_LEVEL_RULES_ONLY,
      objectPermissions: [COMPANY_READ_OBJECT_PERMISSION],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await openObjectPermissionOptions(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Remove rule' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );

    expect(canvas.getByText('Companies')).toBeVisible();
    expect(
      canvas.getByRole('img', { name: 'Record-level rules' }),
    ).toBeVisible();

    expect(await openObjectPermissionOptions(canvasElement)).toBeVisible();
    expect(
      body.queryByRole('menuitem', { name: 'Remove rule' }),
    ).not.toBeInTheDocument();
  },
};

export const RemoveRuleClearsRecordLevelRulesWhenEntitled: Story = {
  beforeEach: () => {
    jotaiStore.set(
      currentWorkspaceState.atom,
      WORKSPACE_WITH_RECORD_LEVEL_PERMISSION_ENTITLEMENT,
    );
  },
  play: async ({ canvasElement }) => {
    await expectRemoveRuleToClearRecordLevelRules(canvasElement);
  },
};

export const RemoveRuleClearsRecordLevelRulesAsAdmin: Story = {
  beforeEach: () => {
    jotaiStore.set(settingsRoleIdsState.atom, [
      ADMIN_ROLE_WITH_CURRENT_WORKSPACE_MEMBER.id,
    ]);
    jotaiStore.set(
      settingsPersistedRoleFamilyState.atomFamily(
        ADMIN_ROLE_WITH_CURRENT_WORKSPACE_MEMBER.id,
      ),
      ADMIN_ROLE_WITH_CURRENT_WORKSPACE_MEMBER,
    );
  },
  play: async ({ canvasElement }) => {
    await expectRemoveRuleToClearRecordLevelRules(canvasElement);
  },
};

export const RowOptionsHiddenWhenRoleIsNotEditable: Story = {
  args: { isEditable: false },
  beforeEach: () => {
    jotaiStore.set(
      currentWorkspaceState.atom,
      WORKSPACE_WITH_RECORD_LEVEL_PERMISSION_ENTITLEMENT,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('img', { name: 'Record-level rules' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Object permission options' }),
    ).not.toBeInTheDocument();
  },
};
