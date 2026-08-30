import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { IsInSidePanelRoutedSurfaceContext } from '@/ui/layout/side-panel/contexts/IsInSidePanelRoutedSurfaceContext';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/information-banner/components/InformationBannerWrapper', () => ({
  InformationBannerWrapper: () => null,
}));

const renderOnSurface = (children: ReactNode, isInSidePanel: boolean) =>
  render(
    <HelmetProvider>
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter>
          <IsInSidePanelRoutedSurfaceContext.Provider value={isInSidePanel}>
            {children}
          </IsInSidePanelRoutedSurfaceContext.Provider>
        </MemoryRouter>
      </JotaiProvider>
    </HelmetProvider>,
  );

// These live on the primitives rather than on each page because guarding them
// per call site let a header through anything that renders one indirectly.
describe('page chrome on the side panel surface', () => {
  it('should render the whole header on the main surface', () => {
    renderOnSurface(
      <PageCardLayout
        header={
          <PageCardHeader
            title="Companies"
            actionButton={<button>Save</button>}
          />
        }
      >
        <div>Body</div>
      </PageCardLayout>,
      false,
    );

    expect(screen.getByText('Companies')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(screen.getByText('Body')).toBeVisible();
  });

  it('should keep the actions and drop the title when hosted in the panel', () => {
    renderOnSurface(
      <PageCardLayout
        header={
          <PageCardHeader
            title="Companies"
            actionButton={<button>Save</button>}
          />
        }
      >
        <div>Body</div>
      </PageCardLayout>,
      true,
    );

    // A hosted field editor commits through this button and has no other one.
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(screen.queryByText('Companies')).not.toBeInTheDocument();
    expect(screen.getByText('Body')).toBeVisible();
  });

  it('should render no header bar in the panel when the page has no actions', () => {
    renderOnSurface(
      <PageCardLayout header={<PageCardHeader title="Companies" />}>
        <div>Body</div>
      </PageCardLayout>,
      true,
    );

    expect(screen.queryByText('Companies')).not.toBeInTheDocument();
    expect(screen.getByText('Body')).toBeVisible();
  });

  it('should keep the secondary bar, which the panel top bar does not replace', () => {
    renderOnSurface(
      <PageCardLayout header={null} secondaryBar={<div>View bar</div>}>
        <div>Body</div>
      </PageCardLayout>,
      true,
    );

    expect(screen.getByText('View bar')).toBeVisible();
  });

  it('should set the document title on the main surface', async () => {
    document.title = 'Untouched';

    renderOnSurface(<PageTitle title="Companies" />, false);

    await waitFor(() => expect(document.title).toBe('Companies'));
  });

  it('should leave the document title alone when hosted in the panel', async () => {
    document.title = 'Untouched';

    renderOnSurface(<PageTitle title="Companies" />, true);

    await waitFor(() => expect(document.title).toBe('Untouched'));
  });
});
