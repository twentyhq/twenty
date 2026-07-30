import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { BookCallEmbed } from '@/onboarding/components/BookCallEmbed';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockCalConfig = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  __esModule: true,
  default: (props: { config?: unknown }) => {
    mockCalConfig(props.config);

    return null;
  },
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => children,
}));

const renderEmbed = ({
  userName,
  workspaceMemberName,
}: {
  userName?: { firstName: string; lastName: string };
  workspaceMemberName?: { firstName: string; lastName: string };
}) => {
  jotaiStore.set(calendarBookingPageIdState.atom, 'team/twenty/talk-to-us');
  jotaiStore.set(currentUserState.atom, {
    id: 'user-id',
    email: 'raphael@acme.com',
    firstName: userName?.firstName ?? '',
    lastName: userName?.lastName ?? '',
  } as never);

  if (workspaceMemberName) {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-id',
      name: workspaceMemberName,
    } as never);
  }

  render(
    <JotaiProvider store={jotaiStore}>
      <BookCallEmbed />
    </JotaiProvider>,
  );

  return mockCalConfig.mock.calls.at(-1)?.[0] as { name: string };
};

describe('BookCallEmbed', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should prefill the name entered at the profile step', () => {
    const config = renderEmbed({
      workspaceMemberName: { firstName: 'Raphael', lastName: 'Bosi' },
    });

    expect(config.name).toBe('Raphael Bosi');
  });

  it('should fall back to the sign-up name when there is no workspace member yet', () => {
    const config = renderEmbed({
      userName: { firstName: 'Raphael', lastName: 'Bosi' },
    });

    expect(config.name).toBe('Raphael Bosi');
  });

  it('should not emit a stray separator when only one name part is set', () => {
    const config = renderEmbed({
      workspaceMemberName: { firstName: 'Raphael', lastName: '' },
    });

    expect(config.name).toBe('Raphael');
  });

  it('should send an empty name rather than a blank string when nothing is known', () => {
    const config = renderEmbed({});

    expect(config.name).toBe('');
  });

  it('should render nothing rather than an empty embed without a booking page', () => {
    render(
      <JotaiProvider store={jotaiStore}>
        <BookCallEmbed />
      </JotaiProvider>,
    );

    expect(mockCalConfig).not.toHaveBeenCalled();
  });
});
