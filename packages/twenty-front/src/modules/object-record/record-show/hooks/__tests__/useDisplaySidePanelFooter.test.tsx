import { renderHook } from '@testing-library/react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { useDisplaySidePanelFooter } from '@/object-record/record-show/hooks/useDisplaySidePanelFooter';
import { MessageChannelType } from '~/generated/graphql';

let mockWorkspaceSurfaceType = 'side-panel';
const mockUseMessageThreadChannel = jest.fn();

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: mockWorkspaceSurfaceType }),
}));

jest.mock('@/activities/emails/hooks/useMessageThreadChannel', () => ({
  useMessageThreadChannel: (...args: unknown[]) =>
    mockUseMessageThreadChannel(...args),
}));

const MESSAGE_THREAD = {
  id: 'thread-id',
  targetObjectNameSingular: StandardObjectNameSingular.MessageThread,
};

const mockChannel = (
  type: MessageChannelType | null,
  messageThreadChannelLoading = false,
) =>
  mockUseMessageThreadChannel.mockReturnValue({
    messageThreadChannel: type === null ? null : { type },
    messageThreadChannelLoading,
  });

describe('useDisplaySidePanelFooter', () => {
  beforeEach(() => {
    mockWorkspaceSurfaceType = 'side-panel';
    mockChannel(null);
  });

  it('hides the footer outside the side panel', () => {
    mockWorkspaceSurfaceType = 'main';

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter({
        id: 'company-id',
        targetObjectNameSingular: StandardObjectNameSingular.Company,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('shows the footer for other records', () => {
    const { result } = renderHook(() =>
      useDisplaySidePanelFooter({
        id: 'company-id',
        targetObjectNameSingular: StandardObjectNameSingular.Company,
      }),
    );

    expect(result.current).toBe(true);
  });

  it('shows the footer for an email thread', () => {
    mockChannel(MessageChannelType.EMAIL);

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter(MESSAGE_THREAD),
    );

    expect(result.current).toBe(true);
  });

  it('hides the footer for an app chat thread', () => {
    mockChannel(MessageChannelType.APP);

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter(MESSAGE_THREAD),
    );

    expect(result.current).toBe(false);
  });

  it('hides the footer while the thread channel is loading', () => {
    mockChannel(null, true);

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter(MESSAGE_THREAD),
    );

    expect(result.current).toBe(false);
  });
});
