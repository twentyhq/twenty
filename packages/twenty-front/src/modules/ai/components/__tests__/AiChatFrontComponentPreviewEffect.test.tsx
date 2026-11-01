import { act, render } from '@testing-library/react';

import { AiChatFrontComponentPreviewEffect } from '@/ai/components/AiChatFrontComponentPreviewEffect';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';

it('retries failed loads, refreshes metadata after success, and cancels on unmount', async () => {
  const loadPreview = jest
    .fn(
      async (_options: { signal: AbortSignal; loadDependencies: boolean }) =>
        true,
    )
    .mockResolvedValueOnce(false);
  const { unmount } = render(
    <AiChatFrontComponentPreviewEffect loadPreview={loadPreview} />,
  );
  await act(async () => undefined);
  expect(loadPreview.mock.calls[0][0].loadDependencies).toBe(true);
  await act(async () =>
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME),
  );
  expect(loadPreview.mock.calls[1][0].loadDependencies).toBe(true);
  await act(async () =>
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME),
  );
  expect(loadPreview.mock.calls[2][0].loadDependencies).toBe(false);
  const signal = loadPreview.mock.calls[2][0].signal;
  unmount();
  expect(signal.aborted).toBe(true);
  act(() => dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME));
  expect(loadPreview).toHaveBeenCalledTimes(3);
});

it('ignores a superseded initial load when deciding whether dependencies are ready', async () => {
  let resolveOld: (loaded: boolean) => void = () => undefined;
  const loadPreview = jest
    .fn(
      async (_options: { signal: AbortSignal; loadDependencies: boolean }) =>
        false,
    )
    .mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveOld = resolve;
      }),
    );
  render(<AiChatFrontComponentPreviewEffect loadPreview={loadPreview} />);
  await act(async () =>
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME),
  );
  expect(loadPreview.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => resolveOld(true));
  await act(async () =>
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME),
  );
  expect(loadPreview.mock.calls[2][0].loadDependencies).toBe(true);
});
