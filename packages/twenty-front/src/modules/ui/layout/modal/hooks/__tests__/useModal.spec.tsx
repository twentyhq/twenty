import { renderHook } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import { type ReactNode, act } from 'react';
import { RecoilRoot } from 'recoil';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';

const modalId = 'test-modal-id';

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <Provider>{children}</Provider>
  </RecoilRoot>
);

describe('useModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open a modal', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useAtomValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: TestWrapper,
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
        const isModalOpened = useAtomValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: TestWrapper,
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
        const isModalOpened = useAtomValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: TestWrapper,
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
        const isModalOpened = useAtomValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: TestWrapper,
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
