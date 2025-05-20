import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { act } from 'react';

jest.mock('@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope');

const mockSetHotkeyScopeAndMemorizePreviousScope = jest.fn();
const mockGoBackToPreviousHotkeyScope = jest.fn();

const modalId = 'test-modal-id';
const customHotkeyScope: HotkeyScope = {
  scope: 'test-scope',
  customScopes: {
    goto: true,
    commandMenu: true,
  },
};

describe('useModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePreviousHotkeyScope as jest.Mock).mockReturnValue({
      setHotkeyScopeAndMemorizePreviousScope:
        mockSetHotkeyScopeAndMemorizePreviousScope,
      goBackToPreviousHotkeyScope: mockGoBackToPreviousHotkeyScope,
    });
  });

  it('should open a modal', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.modal.openModal(modalId);
    });

    expect(result.current.isModalOpened).toBe(true);
  });

  it('should open a modal with custom hotkey scope', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.modal.openModal(modalId, customHotkeyScope);
    });

    expect(result.current.isModalOpened).toBe(true);
    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith(
      customHotkeyScope.scope,
      customHotkeyScope.customScopes,
    );
  });

  it('should close a modal', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
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
    expect(mockGoBackToPreviousHotkeyScope).toHaveBeenCalled();
  });

  it('should toggle a modal (open when closed)', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
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
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
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
    expect(mockGoBackToPreviousHotkeyScope).toHaveBeenCalled();
  });

  it('should toggle a modal with custom hotkey scope', () => {
    const { result } = renderHook(
      () => {
        const modal = useModal();
        const isModalOpened = useRecoilValue(
          isModalOpenedComponentState.atomFamily({ instanceId: modalId }),
        );
        return { modal, isModalOpened };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    act(() => {
      result.current.modal.toggleModal(modalId, customHotkeyScope);
    });

    expect(result.current.isModalOpened).toBe(true);
    expect(mockSetHotkeyScopeAndMemorizePreviousScope).toHaveBeenCalledWith(
      customHotkeyScope.scope,
      customHotkeyScope.customScopes,
    );
  });
});
