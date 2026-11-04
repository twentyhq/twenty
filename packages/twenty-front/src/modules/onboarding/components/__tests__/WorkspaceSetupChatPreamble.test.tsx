import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('WorkspaceSetupChatPreamble', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      name: { firstName: 'Marie', lastName: 'Curie' },
    });
  });

  it('should welcome the member by name', () => {
    render(<WorkspaceSetupChatPreamble />, { wrapper: Wrapper });

    expect(screen.getByText('Welcome to your workspace')).toBeVisible();
    expect(screen.getByText('Marie Curie')).toBeVisible();
    expect(
      screen.getByText("Let's set it up around the way you work."),
    ).toBeVisible();
  });
});
