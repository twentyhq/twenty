import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { captureException } from '@sentry/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

import { useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';

jest.mock('@sentry/react', () => ({ captureException: jest.fn() }));
const mockFetch = jest.fn();
const mockFetchComponentSource = jest.fn();
jest.mock('twenty-front-component-renderer', () => ({
  fetchComponentSource: (...args: unknown[]) =>
    mockFetchComponentSource(...args),
}));
const PREVIEW = {
  pageLayoutType: 'DASHBOARD',
  componentSource: 'export default function render() {}',
  applicationId: 'workspace-app',
  sharedDependenciesChecksum: 'current-checksum',
  mockQueryResult: {
    companies: { edges: [{ node: { name: 'Example company' } }] },
  },
  isCurrent: true,
};
const SHARED_DEPENDENCIES = 'export const dependency = true;';
const loadOptions = () => ({
  signal: new AbortController().signal,
  loadDependencies: true,
});
const originalFetch = global.fetch;
const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);
const renderPreviewHook = () =>
  renderHook(() => useAiChatFrontComponentPreview('draft'), { wrapper });

describe('useAiChatFrontComponentPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch
      .mockReset()
      .mockResolvedValue({ ok: true, json: async () => PREVIEW });
    mockFetchComponentSource.mockReset().mockResolvedValue(SHARED_DEPENDENCIES);
    global.fetch = mockFetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('authenticates both requests and retains the provided sample records', async () => {
    const { result } = renderPreviewHook();
    await act(() => result.current.loadPreview(loadOptions()));
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/drafts/draft'),
      expect.objectContaining({
        credentials: 'include',
        headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
      }),
    );
    expect(mockFetchComponentSource).toHaveBeenCalledWith({
      url: expect.stringContaining(
        '/front-component-shared-dependencies/workspace-app/current-checksum.js',
      ),
      credentials: 'include',
      headers: { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' },
    });
    expect(result.current.preview).toMatchObject({
      ...PREVIEW,
      sharedDependenciesSource: SHARED_DEPENDENCIES,
    });
  });

  it.each([{ isCurrent: false }, { publishedComponentId: 'saved-component' }])(
    'refreshes %s without replacing renderer inputs',
    async (status) => {
      const { result } = renderPreviewHook();
      await act(() => result.current.loadPreview(loadOptions()));
      const initial = result.current.preview;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...PREVIEW,
          ...status,
          componentSource: 'changed source',
          mockQueryResult: {},
        }),
      });
      await act(() =>
        result.current.loadPreview({
          ...loadOptions(),
          loadDependencies: false,
        }),
      );
      expect(result.current.preview).toMatchObject(status);
      expect(result.current.preview?.componentSource).toBe(
        initial?.componentSource,
      );
      expect(result.current.preview?.mockQueryResult).toBe(
        initial?.mockQueryResult,
      );
      expect(result.current.preview?.sharedDependenciesSource).toBe(
        initial?.sharedDependenciesSource,
      );
      expect(mockFetchComponentSource).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['draft', 'dependencies'])(
    'retries an initial %s failure and clears its translated error',
    async (stage) => {
      const failure = new Error('Internal URL /checksum.js');
      if (stage === 'draft') mockFetch.mockRejectedValueOnce(failure);
      else mockFetchComponentSource.mockRejectedValueOnce(failure);
      const { result } = renderPreviewHook();
      await act(() => result.current.loadPreview(loadOptions()));
      expect(result.current.error).toBe('Could not load preview.');
      expect(result.current.preview).toBeUndefined();
      expect(captureException).toHaveBeenCalledWith(failure);
      await act(() => result.current.loadPreview(loadOptions()));
      expect(result.current.error).toBeUndefined();
      expect(result.current.preview?.componentSource).toBe(
        PREVIEW.componentSource,
      );
    },
  );

  it('does not expose a rejected draft response as a technical error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
    const { result } = renderPreviewHook();
    await act(() => result.current.loadPreview(loadOptions()));
    expect(result.current.error).toBe('Could not load preview.');
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Preview request failed: 403' }),
    );
    expect(mockFetchComponentSource).not.toHaveBeenCalled();
  });

  it('ignores an old response after a newer load', async () => {
    let resolveOld: (response: Pick<Response, 'ok' | 'json'>) => void = () =>
      undefined;
    mockFetch.mockReturnValueOnce(
      new Promise<Pick<Response, 'ok' | 'json'>>((resolve) => {
        resolveOld = resolve;
      }),
    );
    const { result } = renderPreviewHook();
    const oldController = new AbortController();
    let oldLoad: Promise<boolean> = Promise.resolve(false);
    act(() => {
      oldLoad = result.current.loadPreview({
        signal: oldController.signal,
        loadDependencies: true,
      });
    });
    oldController.abort();
    await act(() => result.current.loadPreview(loadOptions()));
    await act(async () => {
      resolveOld({
        ok: true,
        json: async () => ({ ...PREVIEW, componentSource: 'old' }),
      });
      await oldLoad;
    });
    expect(result.current.preview?.componentSource).toBe(
      PREVIEW.componentSource,
    );
    expect(mockFetchComponentSource).toHaveBeenCalledTimes(1);
  });

  it('ignores a dependency load cancelled before completion', async () => {
    let resolveDependencies: (source: string) => void = () => undefined;
    mockFetchComponentSource.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveDependencies = resolve;
      }),
    );
    const { result } = renderPreviewHook();
    const controller = new AbortController();
    let load: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      load = result.current.loadPreview({
        signal: controller.signal,
        loadDependencies: true,
      });
    });
    controller.abort();
    await act(async () => {
      resolveDependencies(SHARED_DEPENDENCIES);
      await load;
    });
    expect(result.current.preview).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it.each(['', '   ', 'x'.repeat(2100)])(
    'reports a nonempty bounded runtime error: %.15s',
    async (message) => {
      const { result } = renderPreviewHook();
      await act(() => result.current.reportPreviewError(new Error(message)));
      const expected = message.trim()
        ? message.slice(0, 2000)
        : 'Component failed to render.';
      expect(result.current.error).toBe(expected);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/drafts/draft/preview-error'),
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1',
          },
          body: JSON.stringify({ message: expected }),
        },
      );
    },
  );

  it.each(['network', 'HTTP'])(
    'logs %s report failures while preserving the runtime error',
    async (kind) => {
      if (kind === 'network')
        mockFetch.mockRejectedValueOnce(new Error('Offline'));
      else mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const { result } = renderPreviewHook();
      await act(() =>
        result.current.reportPreviewError(new Error('Render failed')),
      );
      expect(result.current.error).toBe('Render failed');
      expect(captureException).toHaveBeenCalledTimes(1);
    },
  );

  it('ignores an undefined renderer error', async () => {
    const { result } = renderPreviewHook();
    await act(() => result.current.reportPreviewError(undefined));
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
  });
});
