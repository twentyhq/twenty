import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    {children}
  </MemoryRouter>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { onItemClick } = useCommandMenuOnItemClick();

      return {
        onItemClick,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useCommandMenuOnItemClick', () => {
  it('onItemClick', () => {
    const { result } = renderHooks();
    const onClickMock = jest.fn();

    act(() => {
      result.current.onItemClick({
        onClick: onClickMock,
        to: '/test',
      });
    });

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
