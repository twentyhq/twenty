import { render, screen } from '@testing-library/react';

import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';

jest.mock('@/information-banner/components/InformationBannerWrapper', () => ({
  InformationBannerWrapper: () => <div>Information banner</div>,
}));

describe('PageCardLayout', () => {
  it('renders the information banner below the header and above the secondary bar', () => {
    render(
      <PageCardLayout
        header={<div>Page header</div>}
        secondaryBar={<div>Secondary bar</div>}
      >
        <div>Page body</div>
      </PageCardLayout>,
    );

    const informationBanner = screen.getByText('Information banner');

    expect(
      informationBanner.compareDocumentPosition(
        screen.getByText('Page header'),
      ),
    ).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(
      informationBanner.compareDocumentPosition(
        screen.getByText('Secondary bar'),
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      informationBanner.compareDocumentPosition(screen.getByText('Page body')),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
