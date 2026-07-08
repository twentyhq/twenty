import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WelcomeOverlay } from '@/onboarding/components/WelcomeOverlay/WelcomeOverlay';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

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
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });
});
