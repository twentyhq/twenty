import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <MemoryRouter
      initialEntries={['/one', '/two', { pathname: '/three' }]}
      initialIndex={1}
    >
      {children}
    </MemoryRouter>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { onItemClick } = useCommandMenuOnItemClick();

      const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

      return {
        onItemClick,
        isCommandMenuOpened,
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
