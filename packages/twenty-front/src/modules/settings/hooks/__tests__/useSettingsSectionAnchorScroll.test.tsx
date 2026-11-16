import { renderHook } from '@testing-library/react';
import { createRef } from 'react';

import { useSettingsSectionAnchorScroll } from '@/settings/hooks/useSettingsSectionAnchorScroll';

const scrollIntoViewMock = jest.fn();
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalMatchMedia = window.matchMedia;

const mockMatchMedia = (matches: boolean) =>
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches }),
  });

const renderAnchorScroll = ({
  isTargeted,
  locationKey = 'first',
}: {
  isTargeted: boolean;
  locationKey?: string;
}) => {
  const page = document.createElement('div');
  const anchor = document.createElement('div');

  page.appendChild(anchor);
  document.body.appendChild(page);

  const anchorRef = createRef<HTMLDivElement>();

  Object.assign(anchorRef, { current: anchor });

  return renderHook(
    (props: { isTargeted: boolean; locationKey: string }) =>
      useSettingsSectionAnchorScroll({ anchorRef, ...props }),
    { initialProps: { isTargeted, locationKey } },
  );
};

describe('useSettingsSectionAnchorScroll', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    mockMatchMedia(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    Element.prototype.scrollIntoView = originalScrollIntoView;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should scroll the anchor into view when it is targeted', () => {
    renderAnchorScroll({ isTargeted: true });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should scroll without animation under reduced motion', () => {
    mockMatchMedia(true);

    renderAnchorScroll({ isTargeted: true });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
    });
  });

  it('should leave the page alone when the anchor is not targeted', () => {
    renderAnchorScroll({ isTargeted: false });

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('should scroll again when the same target is navigated to again', () => {
    const { rerender } = renderAnchorScroll({ isTargeted: true });

    rerender({ isTargeted: true, locationKey: 'second' });

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });
});
