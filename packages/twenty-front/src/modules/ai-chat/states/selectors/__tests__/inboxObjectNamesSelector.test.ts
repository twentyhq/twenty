import { createStore } from 'jotai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { INBOX_OBJECT_NAMES } from '@/ai-chat/constants/InboxObjectNames';
import { LEGACY_INBOX_OBJECT_NAMES } from '@/ai-chat/constants/LegacyInboxObjectNames';
import { inboxObjectNamesSelector } from '@/ai-chat/states/selectors/inboxObjectNamesSelector';
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

describe('inboxObjectNamesSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('keeps the legacy names while the workspace flag is off', () => {
    const store = buildStore(false);

    expect(store.get(inboxObjectNamesSelector.atom)).toBe(
      LEGACY_INBOX_OBJECT_NAMES,
    );
  });

  it('switches to the inbox names once the workspace flag is on', () => {
    const store = buildStore(true);

    expect(store.get(inboxObjectNamesSelector.atom)).toBe(INBOX_OBJECT_NAMES);
  });
});
