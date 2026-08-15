import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useHideMobileNavigationBarOnScrollDown } from '@/navigation/hooks/useHideMobileNavigationBarOnScrollDown';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const renderUseHideMobileNavigationBarOnScrollDown = () =>
  renderHook(
    () => {
      useHideMobileNavigationBarOnScrollDown();
      return useAtomStateValue(isMobileNavigationBarVisibleState);
    },
    { wrapper: Wrapper },
  );

describe('useHideMobileNavigationBarOnScrollDown', () => {
  let scrollableElement: HTMLDivElement;

  beforeEach(() => {
    scrollableElement = document.createElement('div');
    Object.defineProperty(scrollableElement, 'scrollTop', {
      value: 0,
      writable: true,
    });
    document.body.appendChild(scrollableElement);
  });

  afterEach(() => {
    scrollableElement.remove();
  });

  const scrollTo = (scrollTop: number) => {
    act(() => {
      scrollableElement.scrollTop = scrollTop;
      scrollableElement.dispatchEvent(new Event('scroll'));
    });
  };

  it('should keep the bar visible when a container reports its restored scroll position', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(800);

    expect(result.current).toBe(true);
  });

  it('should hide the bar when scrolling down past the threshold', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(100);
    scrollTo(200);

    expect(result.current).toBe(false);
  });

  it('should show the bar again when scrolling back up past the threshold', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(100);
    scrollTo(200);
    scrollTo(100);

    expect(result.current).toBe(true);
  });

  it('should not hide the bar on scroll moves smaller than the threshold', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(100);
    scrollTo(110);
    scrollTo(105);
    scrollTo(115);

    expect(result.current).toBe(true);
  });

  it('should show the bar again when scrolled back to the top', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(100);
    scrollTo(200);
    scrollTo(0);

    expect(result.current).toBe(true);
  });

  it('should ignore horizontal scrolling', () => {
    const { result } = renderUseHideMobileNavigationBarOnScrollDown();

    scrollTo(200);
    scrollTo(200);
    scrollTo(200);

    expect(result.current).toBe(true);
  });
});
