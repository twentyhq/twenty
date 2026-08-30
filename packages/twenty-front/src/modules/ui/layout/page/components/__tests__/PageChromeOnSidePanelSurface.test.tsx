import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { IsInSidePanelRoutedSurfaceContext } from '@/ui/layout/side-panel/contexts/IsInSidePanelRoutedSurfaceContext';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

jest.mock(
  '@/information-banner/components/InformationBannerWrapper',
  () => ({
    InformationBannerWrapper: () => null,
  }),
);

const renderOnSurface = (children: ReactNode, isInSidePanel: boolean) =>
  render(
    <HelmetProvider>
      <IsInSidePanelRoutedSurfaceContext.Provider value={isInSidePanel}>
        {children}
      </IsInSidePanelRoutedSurfaceContext.Provider>
    </HelmetProvider>,
  );

// These live on the primitives rather than on each page because guarding them
// per call site let a header through anything that renders one indirectly.
describe('page chrome on the side panel surface', () => {
  it('should render the page header on the main surface', () => {
    renderOnSurface(
      <PageCardLayout header={<div>Page header</div>}>
        <div>Body</div>
      </PageCardLayout>,
      false,
    );

    expect(screen.getByText('Page header')).toBeVisible();
    expect(screen.getByText('Body')).toBeVisible();
  });

  it('should drop the page header when the page is hosted in the panel', () => {
    renderOnSurface(
      <PageCardLayout header={<div>Page header</div>}>
        <div>Body</div>
      </PageCardLayout>,
      true,
    );

    expect(screen.queryByText('Page header')).not.toBeInTheDocument();
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
