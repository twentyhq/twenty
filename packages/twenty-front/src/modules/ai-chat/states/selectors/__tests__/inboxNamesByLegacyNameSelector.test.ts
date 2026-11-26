import { createStore } from 'jotai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { INBOX_NAMES_BY_LEGACY_NAME } from '@/ai-chat/constants/InboxNamesByLegacyName';
import { LEGACY_INBOX_NAMES_BY_LEGACY_NAME } from '@/ai-chat/constants/LegacyInboxNamesByLegacyName';
import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const buildStore = (isInboxObjectNamingEnabled: boolean) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED,
        value: isInboxObjectNamingEnabled,
      },
    ],
  });

  return store;
};

describe('inboxNamesByLegacyNameSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('keeps the legacy names while the workspace flag is off', () => {
    const store = buildStore(false);

    expect(store.get(inboxNamesByLegacyNameSelector.atom)).toBe(
      LEGACY_INBOX_NAMES_BY_LEGACY_NAME,
    );
  });

  it('switches to the inbox names once the workspace flag is on', () => {
    const store = buildStore(true);

    expect(store.get(inboxNamesByLegacyNameSelector.atom)).toBe(
      INBOX_NAMES_BY_LEGACY_NAME,
    );
  });
});
