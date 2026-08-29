import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WelcomeOverlay } from '@/onboarding/components/WelcomeOverlay/WelcomeOverlay';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { messages } from '~/locales/generated/en';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(
    JotaiProvider,
    { store: jotaiStore },
    createElement(I18nProvider, { i18n }, children),
  );

describe('WelcomeOverlay', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      name: { firstName: 'Marie', lastName: 'Curie' },
    });
  });

  it('should render nothing when the welcome animation is not visible', () => {
    render(<WelcomeOverlay />, { wrapper: Wrapper });

    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });

  it('should render the welcome message and the member full name when visible', () => {
    jotaiStore.set(isWelcomeAnimationVisibleState.atom, true);

    render(<WelcomeOverlay />, { wrapper: Wrapper });

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('workspace')).toBeInTheDocument();
    expect(screen.getAllByText('Marie Curie').length).toBeGreaterThan(0);
  });
});
