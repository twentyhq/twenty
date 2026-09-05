import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ShareRecordModalContent } from '@/record-share/components/ShareRecordModalContent';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RecordSharesDocument,
  type RecordSharesQuery,
  ShareRecordDocument,
  UnshareRecordDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({
    clickableComponent,
    dropdownComponents,
  }: {
    clickableComponent: ReactNode;
    dropdownComponents: ReactNode;
  }) => (
    <>
      {clickableComponent}
      {dropdownComponents}
    </>
  ),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));

jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <select
      aria-label="Access level"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const RECORD_ID = '20202020-0000-4000-8000-000000000002';
const OWNER_MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const JANE_MEMBER_ID = '20202020-0000-4000-8000-000000000004';
const EVERYONE_PRINCIPAL_ID = '20202020-0000-4000-8000-000000000005';

const target = { objectMetadataId: OBJECT_METADATA_ID, recordId: RECORD_ID };

const workspaceMembers = [
  {
    id: OWNER_MEMBER_ID,
    name: { firstName: 'Tim', lastName: 'Apple' },
    userEmail: 'tim@apple.dev',
    avatarUrl: null,
  },
  {
    id: JANE_MEMBER_ID,
    name: { firstName: 'Jane', lastName: 'Doe' },
    userEmail: 'jane@apple.dev',
    avatarUrl: null,
  },
];

const ownerShare = {
  __typename: 'RecordShare' as const,
  id: '20202020-0000-4000-8000-000000000010',
  principalId: OWNER_MEMBER_ID,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: OWNER_MEMBER_ID,
};

const everyoneShare = {
  __typename: 'RecordShare' as const,
  id: '20202020-0000-4000-8000-000000000011',
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: OWNER_MEMBER_ID,
};

const buildRecordShares = (
  viewerAccessLevel: RecordShareAccessLevel,
  shares = [ownerShare, everyoneShare],
): RecordSharesQuery['recordShares'] => ({
  __typename: 'RecordShares',
  viewerAccessLevel,
  shares,
});

const buildRecordSharesMock = (
  viewerAccessLevel: RecordShareAccessLevel,
  shares = [ownerShare, everyoneShare],
): MockedResponse => ({
  request: { query: RecordSharesDocument, variables: target },
  result: {
    data: { recordShares: buildRecordShares(viewerAccessLevel, shares) },
  },
});

const renderModalContent = (apolloMocks: MockedResponse[]) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeJotaiStore: (store) => {
      store.set(currentWorkspaceMembersState.atom, workspaceMembers);
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <ShareRecordModalContent
        objectMetadataId={OBJECT_METADATA_ID}
        recordId={RECORD_ID}
      />
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('ShareRecordModalContent', () => {
  it('renders the current grants with their level and cause', async () => {
    renderModalContent([buildRecordSharesMock(RecordShareAccessLevel.FULL)]);

    expect(await screen.findByText('Tim Apple')).toBeVisible();
    expect(screen.getByText('Owner')).toBeVisible();
    expect(screen.getByText('Full access', { selector: 'span' })).toBeVisible();
    expect(screen.getByText('Everyone')).toBeVisible();
    expect(screen.getByText('Shared')).toBeVisible();
  });

  it('shares the record with a picked member at the chosen level', async () => {
    const shareRecordResult = jest.fn(() => ({
      data: {
        shareRecord: buildRecordShares(RecordShareAccessLevel.FULL, [
          ownerShare,
          everyoneShare,
          {
            ...everyoneShare,
            id: '20202020-0000-4000-8000-000000000012',
            principalId: JANE_MEMBER_ID,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          },
        ]),
      },
    }));

    renderModalContent([
      buildRecordSharesMock(RecordShareAccessLevel.FULL),
      {
        request: {
          query: ShareRecordDocument,
          variables: {
            ...target,
            shareWith: [
              {
                workspaceMemberId: JANE_MEMBER_ID,
                accessLevel: RecordShareAccessLevel.READ_WRITE,
              },
            ],
          },
        },
        result: shareRecordResult,
      },
    ]);

    const user = userEvent.setup();

    await user.click(await screen.findByText('Jane Doe'));
    await user.selectOptions(
      screen.getAllByRole('combobox', { name: 'Access level' })[0],
      RecordShareAccessLevel.READ_WRITE,
    );
    await user.click(screen.getByRole('button', { name: /^Share/ }));

    await waitFor(() => expect(shareRecordResult).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByText('Shared')).toHaveLength(2));
  });

  it('shares the record with everyone', async () => {
    const shareRecordResult = jest.fn(() => ({
      data: {
        shareRecord: buildRecordShares(RecordShareAccessLevel.FULL),
      },
    }));

    renderModalContent([
      buildRecordSharesMock(RecordShareAccessLevel.FULL, [ownerShare]),
      {
        request: {
          query: ShareRecordDocument,
          variables: {
            ...target,
            shareWith: [
              { everyone: true, accessLevel: RecordShareAccessLevel.READ },
            ],
          },
        },
        result: shareRecordResult,
      },
    ]);

    const user = userEvent.setup();

    await user.click(await screen.findByText('Everyone'));
    await user.click(screen.getByRole('button', { name: /^Share/ }));

    await waitFor(() => expect(shareRecordResult).toHaveBeenCalled());
    expect(await screen.findByText('Shared')).toBeVisible();
  });

  it('changes the level of an existing manual grant', async () => {
    const shareRecordResult = jest.fn(() => ({
      data: {
        shareRecord: buildRecordShares(RecordShareAccessLevel.FULL, [
          ownerShare,
          { ...everyoneShare, accessLevel: RecordShareAccessLevel.FULL },
        ]),
      },
    }));

    renderModalContent([
      buildRecordSharesMock(RecordShareAccessLevel.FULL),
      {
        request: {
          query: ShareRecordDocument,
          variables: {
            ...target,
            shareWith: [
              { everyone: true, accessLevel: RecordShareAccessLevel.FULL },
            ],
          },
        },
        result: shareRecordResult,
      },
    ]);

    const user = userEvent.setup();

    expect(await screen.findByText('Everyone')).toBeVisible();
    await user.selectOptions(
      screen.getAllByRole('combobox', { name: 'Access level' })[1],
      RecordShareAccessLevel.FULL,
    );

    await waitFor(() => expect(shareRecordResult).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getAllByRole('combobox', { name: 'Access level' })[1],
      ).toHaveValue(RecordShareAccessLevel.FULL),
    );
  });

  it('removes a manual grant', async () => {
    const unshareRecordResult = jest.fn(() => ({
      data: {
        unshareRecord: buildRecordShares(RecordShareAccessLevel.FULL, [
          ownerShare,
        ]),
      },
    }));

    renderModalContent([
      buildRecordSharesMock(RecordShareAccessLevel.FULL),
      {
        request: {
          query: UnshareRecordDocument,
          variables: { ...target, principalId: EVERYONE_PRINCIPAL_ID },
        },
        result: unshareRecordResult,
      },
    ]);

    const user = userEvent.setup();

    expect(await screen.findByText('Everyone')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(unshareRecordResult).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText('Shared')).not.toBeInTheDocument(),
    );
  });

  it('is read only when the viewer does not hold full access', async () => {
    renderModalContent([buildRecordSharesMock(RecordShareAccessLevel.READ)]);

    expect(
      await screen.findByText(
        'Only members with full access can change who this record is shared with.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Everyone')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Share/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
  });
});
