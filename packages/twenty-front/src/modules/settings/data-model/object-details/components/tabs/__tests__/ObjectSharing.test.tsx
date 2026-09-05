import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ObjectSharing } from '@/settings/data-model/object-details/components/tabs/ObjectSharing';
import { DELETE_SHARING_RULE } from '@/settings/data-model/sharing/graphql/mutations/deleteSharingRuleMutation';
import { SHARING_RULES } from '@/settings/data-model/sharing/graphql/queries/sharingRulesQuery';
import {
  FindManyCommandMenuItemsDocument,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RowLevelPermissionPredicateOperand,
  UpdateOneObjectMetadataItemDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: { value: string | null; label: string }[];
    value: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <select
      aria-label={label}
      value={value ?? ''}
      onChange={(event) =>
        onChange(
          options.find((option) => (option.value ?? '') === event.target.value)
            ?.value ?? null,
        )
      }
    >
      {options.map((option) => (
        <option key={option.value ?? 'none'} value={option.value ?? ''}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: jest.fn(), closeModal: jest.fn() }),
}));

jest.mock('@/ui/layout/modal/components/ConfirmationModal', () => ({
  ConfirmationModal: ({
    title,
    subtitle,
    confirmButtonText,
    onConfirmClick,
  }: {
    title: string;
    subtitle: ReactNode;
    confirmButtonText: string;
    onConfirmClick: () => void;
  }) => (
    <div role="dialog" aria-label={title}>
      {subtitle}
      <button onClick={onConfirmClick}>{confirmButtonText}</button>
    </div>
  ),
}));

const JANE_MEMBER_ID = '20202020-0000-4000-8000-000000000004';
const EVERYONE_RULE_ID = '20202020-0000-4000-8000-000000000010';
const JANE_RULE_ID = '20202020-0000-4000-8000-000000000011';

const taskObjectMetadataItem = {
  ...getTestEnrichedObjectMetadataItemsMock().find(
    (objectMetadataItem) => objectMetadataItem.nameSingular === 'task',
  ),
  readability: MetadataReadability.OPEN,
  readabilityParentFieldUniversalIdentifiers: null,
  ownerFieldMetadataId: null,
} as EnrichedObjectMetadataItem;

const buildSharingRule = (
  overrides: Partial<{
    id: string;
    name: string;
    granteePrincipalType: RecordSharePrincipalType;
    granteePrincipalId: string | null;
    accessLevel: RecordShareAccessLevel;
    rowLevelPermissionPredicates: object[];
  }>,
) => ({
  __typename: 'SharingRule' as const,
  id: EVERYONE_RULE_ID,
  objectMetadataId: taskObjectMetadataItem.id,
  name: 'Everyone reads',
  description: null,
  granteePrincipalType: RecordSharePrincipalType.EVERYONE,
  granteePrincipalId: null,
  granteeRoleId: null,
  accessLevel: RecordShareAccessLevel.READ,
  isActive: true,
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  ...overrides,
});

const sharingRules = [
  buildSharingRule({}),
  buildSharingRule({
    id: JANE_RULE_ID,
    name: 'Jane edits her tasks',
    granteePrincipalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
    granteePrincipalId: JANE_MEMBER_ID,
    accessLevel: RecordShareAccessLevel.READ_WRITE,
    rowLevelPermissionPredicates: [
      {
        __typename: 'RowLevelPermissionPredicate',
        id: '20202020-0000-4000-8000-000000000020',
        fieldMetadataId: taskObjectMetadataItem.fields[0].id,
        objectMetadataId: taskObjectMetadataItem.id,
        operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
        subFieldName: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
        rowLevelPermissionPredicateGroupId: null,
        positionInRowLevelPermissionPredicateGroup: null,
        roleId: null,
        sharingRuleId: JANE_RULE_ID,
        value: null,
      },
    ],
  }),
];

const sharingRulesMock: MockedResponse = {
  request: {
    query: SHARING_RULES,
    variables: { objectMetadataId: taskObjectMetadataItem.id },
  },
  result: { data: { sharingRules } },
  maxUsageCount: Number.POSITIVE_INFINITY,
};

const commandMenuItemsMock: MockedResponse = {
  request: { query: FindManyCommandMenuItemsDocument },
  result: { data: { commandMenuItems: [] } },
};

const renderObjectSharing = (apolloMocks: MockedResponse[]) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [sharingRulesMock, commandMenuItemsMock, ...apolloMocks],
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceMembersState.atom, [
        {
          id: JANE_MEMBER_ID,
          name: { firstName: 'Jane', lastName: 'Doe' },
          userEmail: 'jane@apple.dev',
          avatarUrl: null,
        },
      ]);
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <ObjectSharing objectMetadataItem={taskObjectMetadataItem} />
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('ObjectSharing', () => {
  it('renders the level, the owner field select and the sharing rules', async () => {
    renderObjectSharing([]);

    expect(screen.getByRole('combobox', { name: 'Level' })).toHaveValue(
      MetadataReadability.OPEN,
    );
    expect(
      screen.getByRole('option', { name: 'Assignee' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Owner field' })).toHaveValue(
      '',
    );

    expect(await screen.findByText('Everyone reads')).toBeVisible();
    expect(screen.getByText('Everyone')).toBeVisible();
    expect(screen.getByText('All records')).toBeVisible();
    expect(screen.getByText('Jane edits her tasks')).toBeVisible();
    expect(screen.getByText('Jane Doe')).toBeVisible();
    expect(screen.getByText('1 criteria')).toBeVisible();
  });

  it('asks for a backfill rule before making the object private', async () => {
    const updateResult = jest.fn(() => ({
      data: {
        updateOneObject: {
          __typename: 'Object',
          id: taskObjectMetadataItem.id,
          nameSingular: taskObjectMetadataItem.nameSingular,
          namePlural: taskObjectMetadataItem.namePlural,
          labelSingular: taskObjectMetadataItem.labelSingular,
          labelPlural: taskObjectMetadataItem.labelPlural,
          description: taskObjectMetadataItem.description,
          icon: taskObjectMetadataItem.icon,
          color: null,
          isActive: true,
          isSearchable: true,
          openRecordIn: taskObjectMetadataItem.openRecordIn,
          createdAt: taskObjectMetadataItem.createdAt,
          updatedAt: taskObjectMetadataItem.updatedAt,
          labelIdentifierFieldMetadataId:
            taskObjectMetadataItem.labelIdentifierFieldMetadataId,
          imageIdentifierFieldMetadataId: null,
          isLabelSyncedWithName: false,
          applicationId: taskObjectMetadataItem.applicationId,
          readability: MetadataReadability.PRIVATE,
          readabilityParentFieldUniversalIdentifiers: null,
          ownerFieldMetadataId: null,
        },
      },
    }));

    renderObjectSharing([
      {
        request: {
          query: UpdateOneObjectMetadataItemDocument,
          variables: {
            idToUpdate: taskObjectMetadataItem.id,
            updatePayload: {
              readability: MetadataReadability.PRIVATE,
              backfillSharingRule: {
                granteePrincipalType: RecordSharePrincipalType.EVERYONE,
                accessLevel: RecordShareAccessLevel.READ_WRITE,
              },
            },
          },
        },
        result: updateResult,
      },
    ]);

    const user = userEvent.setup();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Level' }),
      MetadataReadability.PRIVATE,
    );

    const dialog = screen.getByRole('dialog', { name: 'Make Tasks private?' });

    expect(dialog).toBeVisible();

    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'Access level' }),
      RecordShareAccessLevel.READ_WRITE,
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Make private' }),
    );

    await waitFor(() => expect(updateResult).toHaveBeenCalled());
  });

  it('deletes a rule', async () => {
    const deleteResult = jest.fn(() => ({
      data: { deleteSharingRule: sharingRules[0] },
    }));

    renderObjectSharing([
      {
        request: {
          query: DELETE_SHARING_RULE,
          variables: { id: EVERYONE_RULE_ID },
        },
        result: deleteResult,
      },
    ]);

    const user = userEvent.setup();

    expect(await screen.findByText('Everyone reads')).toBeVisible();
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    await waitFor(() => expect(deleteResult).toHaveBeenCalled());
  });
});
