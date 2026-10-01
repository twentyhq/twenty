import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { IconHome, IconSearch } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

jest.mock('@/navigation/hooks/useMobileNavigationBarItems');

const renderMobileNavigationBar = (pathname = '/home') => {
  const store = createStore();

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <div role="region" aria-label="Page content" />
        <MobileNavigationBar />
        <Button>Page action</Button>
      </MemoryRouter>
    </Provider>,
  );

  return { store };
};

const onSearchClick = jest.fn();

describe('MobileNavigationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useMobileNavigationBarItems).mockReturnValue({
      activeItemName: 'home',
      items: [
        { name: 'home', label: 'Home', Icon: IconHome, onClick: jest.fn() },
        {
          name: 'search',
          label: 'Search',
          Icon: IconSearch,
          onClick: onSearchClick,
        },
      ],
    });
  });

  it('exposes labeled buttons and the active destination', () => {
    renderMobileNavigationBar();

    expect(screen.getByRole('navigation')).not.toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Home', pressed: true }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Search', pressed: false }),
    ).toBeVisible();
  });

  it('activates an item by pointer, Enter, and Space', async () => {
    const user = userEvent.setup();
    renderMobileNavigationBar();

    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onSearchClick).toHaveBeenCalledTimes(3);
  });

  it('hides the bar and skips its buttons on chat pages', async () => {
    const user = userEvent.setup();
    renderMobileNavigationBar('/chat/20202020-0687-4c41-b707-ed1bfca972a7');

    expect(screen.getByRole('navigation', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.queryByRole('button', { name: 'Home' }),
    ).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Page action' })).toHaveFocus();
  });

  it('removes and restores keyboard access when the side panel opens and closes', async () => {
    const user = userEvent.setup();
    const { store } = renderMobileNavigationBar();

    act(() => store.set(isSidePanelOpenedState.atom, true));

    expect(screen.getByRole('navigation', { hidden: true })).toHaveAttribute(
      'inert',
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Page action' })).toHaveFocus();

    act(() => store.set(isSidePanelOpenedState.atom, false));

    expect(screen.getByRole('navigation')).not.toHaveAttribute('inert');
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
  });

  it('hides while scrolling down and reveals while scrolling back up', () => {
    renderMobileNavigationBar();
    const content = screen.getByRole('region', { name: 'Page content' });

    fireEvent.scroll(content, { target: { scrollTop: 100 } });
    fireEvent.scroll(content, { target: { scrollTop: 130 } });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    fireEvent.scroll(content, { target: { scrollTop: 100 } });

    expect(screen.getByRole('navigation')).not.toHaveAttribute('inert');
  });
});
