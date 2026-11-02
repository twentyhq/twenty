import { renderHook } from '@testing-library/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

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
  targetObjectNameSingular: CoreObjectNameSingular.MessageThread,
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
        targetObjectNameSingular: CoreObjectNameSingular.Company,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('shows the footer for other records without loading a channel', () => {
    const { result } = renderHook(() =>
      useDisplaySidePanelFooter({
        id: 'company-id',
        targetObjectNameSingular: CoreObjectNameSingular.Company,
      }),
    );

    expect(result.current).toBe(true);
    expect(mockUseMessageThreadChannel).toHaveBeenCalledWith('company-id', {
      skip: true,
    });
  });

  it('shows the footer for an email thread', () => {
    mockChannel(MessageChannelType.EMAIL);

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter(MESSAGE_THREAD),
    );

    expect(result.current).toBe(true);
  });

  it.each([MessageChannelType.APP, MessageChannelType.SMS])(
    'hides the footer for a %s chat thread',
    (type) => {
      mockChannel(type);

      const { result } = renderHook(() =>
        useDisplaySidePanelFooter(MESSAGE_THREAD),
      );

      expect(result.current).toBe(false);
    },
  );

  it('hides the footer while the thread channel is loading', () => {
    mockChannel(null, true);

    const { result } = renderHook(() =>
      useDisplaySidePanelFooter(MESSAGE_THREAD),
    );

    expect(result.current).toBe(false);
  });
});
