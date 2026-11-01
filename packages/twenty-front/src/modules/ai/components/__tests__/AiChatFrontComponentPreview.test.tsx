import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { type ComponentProps } from 'react';
import { type FrontComponentSourceRenderer } from 'twenty-front-component-renderer';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';

let mockIsEnabled = true;
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsEnabled,
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
const SHARED_DEPENDENCIES = 'export const sharedDependency = true;';
const mockFetch = jest.fn();
const mockFetchComponentSource = jest.fn();
const originalFetch = global.fetch;
const previewElement = (draftId = 'draft') => (
  <I18nProvider i18n={i18n}>
    <AiChatFrontComponentPreview draftId={draftId} />
  </I18nProvider>
);

let mockRendererProps: ComponentProps<typeof FrontComponentSourceRenderer>;
jest.mock('twenty-front-component-renderer', () => ({
  fetchComponentSource: (...args: unknown[]) =>
    mockFetchComponentSource(...args),
  FrontComponentSourceRenderer: (props: typeof mockRendererProps) => {
    mockRendererProps = props;
    return <div>Rendered component {props.componentId}</div>;
  },
}));

describe('AI front component preview', () => {
  beforeEach(() => {
    mockIsEnabled = true;
    mockFetch
      .mockReset()
      .mockResolvedValue({ ok: true, json: async () => PREVIEW });
    mockFetchComponentSource.mockReset().mockResolvedValue(SHARED_DEPENDENCIES);
    global.fetch = mockFetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('renders mocked records using the application dependency endpoint', async () => {
    render(previewElement());
    await screen.findByText('Rendered component draft');
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText('Dashboard widget')).toBeInTheDocument();
    expect(mockRendererProps).toMatchObject({
      componentSource: PREVIEW.componentSource,
      mockQueryResult: PREVIEW.mockQueryResult,
      sharedDependenciesSource: SHARED_DEPENDENCIES,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/ai-front-components/drafts/draft'),
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(mockFetchComponentSource).toHaveBeenCalledWith({
      url: expect.stringContaining(
        '/front-component-shared-dependencies/workspace-app/current-checksum.js',
      ),
      credentials: 'include',
    });
    act(() => mockRendererProps.onReady?.());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    [{ pageLayoutType: 'RECORD_PAGE' }, 'Record page widget'],
    [
      { isCurrent: false },
      'A newer revision exists. Open the latest preview to save.',
    ],
    [{ publishedComponentId: 'saved-component' }, 'Saved to Workspace app'],
  ])('shows the draft status %s', async (status, label) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...PREVIEW, ...status }),
    });
    render(previewElement());
    expect(await screen.findByText(label)).toBeInTheDocument();
    expect(screen.getByText('Rendered component draft')).toBeInTheDocument();
  });

  it('shows runtime errors and reports a bounded message for the next agent turn', async () => {
    render(previewElement());
    await screen.findByText('Rendered component draft');
    const message = 'x'.repeat(2100);

    act(() => mockRendererProps.onError(new Error(message)));
    expect(screen.getByRole('alert')).toHaveTextContent(message.slice(0, 2000));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/drafts/draft/preview-error'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ message: message.slice(0, 2000) }),
      }),
    );
    act(() => mockRendererProps.onError(undefined));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('keeps the runtime error visible if reporting fails', async () => {
    render(previewElement());
    await screen.findByText('Rendered component draft');
    mockFetch.mockRejectedValueOnce(new Error('Offline'));
    await act(async () =>
      mockRendererProps.onError(new Error('Render failed')),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Render failed');
  });

  it('shows expired or inaccessible previews as unavailable', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    render(previewElement());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preview unavailable',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does not render a component without its dependencies', async () => {
    mockFetchComponentSource.mockRejectedValueOnce(
      new Error('Dependencies unavailable'),
    );
    render(previewElement());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Dependencies unavailable',
    );
    expect(
      screen.queryByText('Rendered component draft'),
    ).not.toBeInTheDocument();
  });

  it('ignores an old response when the selected draft changes', async () => {
    let resolveOldRequest: (
      value: Pick<Response, 'ok' | 'json'>,
    ) => void = () => undefined;
    const oldRequest = new Promise<Pick<Response, 'ok' | 'json'>>((resolve) => {
      resolveOldRequest = resolve;
    });
    mockFetch.mockReturnValueOnce(oldRequest);
    const { rerender } = render(previewElement('old'));
    rerender(previewElement('new'));
    await screen.findByText('Rendered component new');
    await act(async () =>
      resolveOldRequest({
        ok: true,
        json: async () => ({ ...PREVIEW, componentSource: 'old source' }),
      }),
    );
    await waitFor(() =>
      expect(mockRendererProps.componentSource).toBe(PREVIEW.componentSource),
    );
    expect(
      screen.queryByText('Rendered component old'),
    ).not.toBeInTheDocument();
  });

  it('does not fetch or render when the workspace flag is off', () => {
    mockIsEnabled = false;
    render(previewElement());
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockFetchComponentSource).not.toHaveBeenCalled();
  });
});
