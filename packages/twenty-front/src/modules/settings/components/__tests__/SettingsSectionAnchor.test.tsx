import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsSectionAnchor } from '@/settings/components/SettingsSectionAnchor';

const scrollIntoViewMock = jest.fn();
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalMatchMedia = window.matchMedia;

const renderAnchor = (hash: string) =>
  render(
    <MemoryRouter initialEntries={[`/settings/applications/app-id${hash}`]}>
      <SettingsSectionAnchor sectionId="connections">
        <p>Connections</p>
      </SettingsSectionAnchor>
    </MemoryRouter>,
  );

describe('SettingsSectionAnchor', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollIntoView = originalScrollIntoView;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should scroll to and highlight the section the hash targets', () => {
    renderAnchor('#general/connections');

    expect(screen.getByText('Connections')).toBeVisible();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(screen.getByText('Connections').parentElement).toHaveAttribute(
      'data-highlighted',
      'true',
    );
  });

  it('should leave the section alone when the hash targets only the tab', () => {
    renderAnchor('#general');

    expect(screen.getByText('Connections')).toBeVisible();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    expect(screen.getByText('Connections').parentElement).toHaveAttribute(
      'data-highlighted',
      'false',
    );
  });

  it('should leave the section alone when the hash targets another section', () => {
    renderAnchor('#general/variables');

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
