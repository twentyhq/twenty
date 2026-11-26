import { act, renderHook } from '@testing-library/react';
import { captureException } from '@sentry/react';
import { fetchComponentSource } from 'twenty-front-component-renderer';

import { useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';

jest.mock('twenty-front-component-renderer', () => ({
  fetchComponentSource: jest.fn(),
}));
jest.mock('@sentry/react', () => ({ captureException: jest.fn() }));

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
const preview = {
  applicationId: 'application-id',
  componentSource: 'component source',
  sharedDependenciesChecksum: 'checksum',
  mockQueryResult: {},
  isCurrent: true,
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  globalThis.fetch = fetchMock;
  fetchMock.mockResolvedValue({ ok: true, json: async () => preview });
  jest.mocked(fetchComponentSource).mockResolvedValue('dependencies');
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

it.each(['draft', 'dependencies'])(
  'recovers an initial %s failure without a reload',
  async (phase) => {
    if (phase === 'draft') {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    } else {
      jest
        .mocked(fetchComponentSource)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    }
    const { result } = renderHook(() =>
      useAiChatFrontComponentPreview('draft-id'),
    );

    await act(async () => {
      const loading = result.current.loadPreview({
        signal: new AbortController().signal,
        shouldLoadDependencies: true,
      });
      await jest.runAllTimersAsync();
      expect(await loading).toBe(true);
    });

    expect(result.current.preview?.componentSource).toBe('component source');
    expect(result.current.error).toBeUndefined();
    expect(captureException).not.toHaveBeenCalled();
  },
);

it.each([401, 403, 404])(
  'does not retry a permanent draft failure (%s)',
  async (status) => {
    fetchMock.mockResolvedValue({ ok: false, status });
    const { result } = renderHook(() =>
      useAiChatFrontComponentPreview('draft-id'),
    );
    await act(async () => {
      expect(
        await result.current.loadPreview({
          signal: new AbortController().signal,
          shouldLoadDependencies: true,
        }),
      ).toBe(false);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe('Could not load preview.');
  },
);

it('bounds retries and reports which stage failed', async () => {
  jest
    .mocked(fetchComponentSource)
    .mockRejectedValue(new TypeError('Failed to fetch'));
  const { result } = renderHook(() =>
    useAiChatFrontComponentPreview('draft-id'),
  );
  await act(async () => {
    const loading = result.current.loadPreview({
      signal: new AbortController().signal,
      shouldLoadDependencies: true,
    });
    await jest.runAllTimersAsync();
    expect(await loading).toBe(false);
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(captureException).toHaveBeenCalledWith(expect.any(TypeError), {
    tags: { previewLoadPhase: 'shared-dependencies' },
    extra: { draftId: 'draft-id', attempts: 3 },
  });
  expect(result.current.error).toBe('Could not load preview.');
});

it('does not retry after a newer request aborts the load', async () => {
  const controller = new AbortController();
  fetchMock.mockImplementationOnce(async () => {
    controller.abort();
    throw new TypeError('Failed to fetch');
  });
  const { result } = renderHook(() =>
    useAiChatFrontComponentPreview('draft-id'),
  );
  await act(async () => {
    expect(
      await result.current.loadPreview({
        signal: controller.signal,
        shouldLoadDependencies: true,
      }),
    ).toBe(false);
    await jest.runAllTimersAsync();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(result.current.error).toBeUndefined();
  expect(captureException).not.toHaveBeenCalled();
});
