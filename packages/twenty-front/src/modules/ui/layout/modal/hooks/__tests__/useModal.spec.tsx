import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode, act } from 'react';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const modalId = 'test-modal-id';

const createTestWrapper = () => {
  const store = createStore();

  const TestWrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return TestWrapper;
};

describe('useModal', () => {
  it('should open a modal', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useAtomComponentStateValue(
          isModalOpenedComponentState,
          modalId,
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.modal.openModal(modalId);
    });

    expect(result.current.isModalOpened).toBe(true);
  });

  it('should close a modal', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useAtomComponentStateValue(
          isModalOpenedComponentState,
          modalId,
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.modal.openModal(modalId);
    });
    expect(result.current.isModalOpened).toBe(true);

    act(() => {
      result.current.modal.closeModal(modalId);
    });

    expect(result.current.isModalOpened).toBe(false);
  });

  it('should toggle a modal (open when closed)', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useAtomComponentStateValue(
          isModalOpenedComponentState,
          modalId,
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    expect(result.current.isModalOpened).toBe(false);

    act(() => {
      result.current.modal.toggleModal(modalId);
    });

    expect(result.current.isModalOpened).toBe(true);
  });

  it('should toggle a modal (close when open)', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useAtomComponentStateValue(
          isModalOpenedComponentState,
          modalId,
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: createTestWrapper(),
      },
    );

    act(() => {
      result.current.modal.openModal(modalId);
    });
    expect(result.current.isModalOpened).toBe(true);

    act(() => {
      result.current.modal.toggleModal(modalId);
    });

    expect(result.current.isModalOpened).toBe(false);
  });
});
