import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { WelcomeOverlay } from '@/onboarding/components/WelcomeOverlay/WelcomeOverlay';
import { welcomeAnimationVisibleState } from '@/onboarding/states/welcomeAnimationVisibleState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

describe('WelcomeOverlay', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      displayName: 'Bonapara',
    });
  });

  it('should render nothing when the welcome animation is not visible', () => {
    render(<WelcomeOverlay />, { wrapper: Wrapper });

    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
  });

  it('should render the welcome message and workspace name when visible', () => {
    jotaiStore.set(welcomeAnimationVisibleState.atom, true);

    render(<WelcomeOverlay />, { wrapper: Wrapper });

    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('workspace')).toBeInTheDocument();
    expect(screen.getByText('Bonapara')).toBeInTheDocument();
  });
});
