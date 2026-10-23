import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';

let mockIsEnabled = true;
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsEnabled,
}));

const PREVIEW = {
  draftId: 'draft',
  name: 'Renewals',
  pageLayoutType: 'DASHBOARD',
  componentSource: 'export default function render() {}',
  sharedDependenciesSource: 'export const sharedDependency = true;',
  data: { records: [{ name: 'Example company' }] },
  isCurrent: true,
  published: false,
};
const mockFetch = jest.fn();
const originalFetch = global.fetch;
const renderPreview = (onReadyChange = jest.fn()) => {
  render(
    <I18nProvider i18n={i18n}>
      <AiChatFrontComponentPreview
        draftId="draft"
        onReadyChange={onReadyChange}
      />
    </I18nProvider>,
  );
  return onReadyChange;
};

let mockRendererProps: { onReady: () => void; onError: (error: Error) => void };
jest.mock('twenty-front-component-renderer', () => ({
  FrontComponentSourceRenderer: (props: typeof mockRendererProps) => {
    mockRendererProps = props;
    return <div>Rendered component</div>;
  },
}));

describe('AI front component preview', () => {
  beforeEach(() => {
    mockIsEnabled = true;
    mockFetch
      .mockReset()
      .mockResolvedValue({ ok: true, json: async () => PREVIEW });
    global.fetch = mockFetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('shows the preview without explanatory copy and waits for server-confirmed readiness', async () => {
    const onReadyChange = renderPreview();
    await screen.findByText('Rendered component');
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText('Dashboard widget')).toBeInTheDocument();
    expect(mockRendererProps).toEqual(
      expect.objectContaining({
        componentSource: PREVIEW.componentSource,
        sharedDependenciesSource: PREVIEW.sharedDependenciesSource,
      }),
    );
    expect(
      screen.queryByText('Nothing is saved until you approve.'),
    ).not.toBeInTheDocument();
    expect(onReadyChange).not.toHaveBeenCalledWith(true);
    act(() => mockRendererProps.onReady());
    await waitFor(() => expect(onReadyChange).toHaveBeenCalledWith(true));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/drafts/draft/diagnostic'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ status: 'ready' }),
      }),
    );
  });

  it('shows the selected record-page surface', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...PREVIEW, pageLayoutType: 'RECORD_PAGE' }),
    });
    renderPreview();
    expect(await screen.findByText('Record page widget')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard widget')).not.toBeInTheDocument();
  });

  it('shows runtime errors and reports them for the next agent turn', async () => {
    const onReadyChange = renderPreview();
    await screen.findByText('Rendered component');

    act(() =>
      mockRendererProps.onError(new Error('Unsupported resource: connect-src')),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unsupported resource: connect-src',
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(onReadyChange).not.toHaveBeenCalledWith(true);
    act(() => mockRendererProps.onReady());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('keeps superseded drafts visible but never enables saving them', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...PREVIEW, isCurrent: false }),
    });
    const onReadyChange = renderPreview();
    await screen.findByText('Rendered component');

    expect(screen.getByText(/A newer revision exists/)).toBeInTheDocument();
    act(() => mockRendererProps.onReady());
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(onReadyChange).not.toHaveBeenCalledWith(true);
  });

  it('shows expired or inaccessible previews as unavailable', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const onReadyChange = renderPreview();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preview unavailable',
    );
    expect(onReadyChange).not.toHaveBeenCalledWith(true);
  });

  it('does not fetch or render when the workspace flag is off', () => {
    mockIsEnabled = false;
    renderPreview();

    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
