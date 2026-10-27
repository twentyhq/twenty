import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSidePanelShareRecordInvitation } from '@/side-panel/pages/share-record/hooks/useSidePanelShareRecordInvitation';
import {
  RecordShareAccessLevel,
  RecordSharingMode,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const RESTRICTED_SHARING: RecordSharingFieldsFragment = {
  sharingMode: RecordSharingMode.PRIVATE,
  canManageSharing: true,
  permissions: {
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canSoftDelete: true,
  },
  generalAccessLevel: RecordShareAccessLevel.NONE,
  defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
  hasManagedGeneralAccess: false,
  roles: [],
  shares: [],
};

const setShare = jest.fn();
const setGeneralAccess = jest.fn();

const renderInvitation = () => {
  const store = createStore();
  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    displayName: 'Acme',
  });
  store.set(currentWorkspaceMembersState.atom, []);

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </JotaiProvider>
  );

  return renderHook(
    ({ sharing }: { sharing: RecordSharingFieldsFragment }) =>
      useSidePanelShareRecordInvitation({
        sharing,
        saving: false,
        setShare,
        setGeneralAccess,
        objectLabelPlural: 'Companies',
      }),
    { initialProps: { sharing: RESTRICTED_SHARING }, wrapper: Wrapper },
  );
};

describe('useSidePanelShareRecordInvitation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('drops a staged Everyone recipient once the record gains workspace access', async () => {
    const { result, rerender } = renderInvitation();
    const everyoneRecipients = result.current.recipients.filter(
      (recipient) => recipient.kind === 'everyone',
    );

    act(() => {
      result.current.onRecipientsChange(everyoneRecipients);
    });

    expect(result.current.hasEveryoneRecipient).toBe(true);

    rerender({
      sharing: {
        ...RESTRICTED_SHARING,
        generalAccessLevel: RecordShareAccessLevel.READ,
      },
    });

    expect(result.current.selectedRecipients).toEqual([]);
    expect(result.current.hasEveryoneRecipient).toBe(false);
    await expect(result.current.onInvite()).resolves.toBe(false);
    expect(setGeneralAccess).not.toHaveBeenCalled();
  });
});
