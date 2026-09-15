import { MobileNavigationBar } from '@/navigation/components/MobileNavigationBar';
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { IconHome } from 'twenty-ui/icon';

jest.mock('@/navigation/hooks/useMobileNavigationBarItems');

jest.mock('@/navigation/components/MobileNavigationBarScrollEffect', () => ({
  MobileNavigationBarScrollEffect: () => null,
}));

const renderMobileNavigationBar = (pathname: string) =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={[pathname]}>
        <MobileNavigationBar />
      </MemoryRouter>
    </Provider>,
  );

describe('MobileNavigationBar', () => {
  beforeEach(() => {
    jest.mocked(useMobileNavigationBarItems).mockReturnValue({
      activeItemName: 'home',
      items: [
        { name: 'home', label: 'Home', Icon: IconHome, onClick: jest.fn() },
      ],
    });
  });

  it('shows the bar on the home page', () => {
    renderMobileNavigationBar('/home');

    expect(screen.getByRole('navigation')).not.toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('hides the bar on the chat page', () => {
    renderMobileNavigationBar('/chat/20202020-0687-4c41-b707-ed1bfca972a7');

    expect(screen.getByRole('navigation', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
