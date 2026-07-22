import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { WELCOME_TITLE_WORDS } from '@/onboarding/constants/WelcomeTitleWords';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';

jest.mock('@/onboarding/components/WelcomeOverlay/WelcomePersonChip', () => ({
  WelcomePersonChip: () => <span data-testid="person-chip" />,
}));

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
  });

  it('should carry the handoff target id on a single non-wrapping run', () => {
    const { container } = render(<WorkspaceSetupChatPreamble />, {
      wrapper: Wrapper,
    });

    const handoffRun = container.querySelector(
      `#${WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID}`,
    );

    expect(handoffRun).toBeInTheDocument();
    expect(handoffRun?.textContent).toContain(WELCOME_TITLE_WORDS.join(' '));
  });
});
