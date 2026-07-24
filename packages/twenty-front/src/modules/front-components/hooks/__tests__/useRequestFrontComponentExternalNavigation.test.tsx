import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useRequestFrontComponentExternalNavigation } from '@/front-components/hooks/useRequestFrontComponentExternalNavigation';
import { frontComponentExternalLinkModalConfigState } from '@/front-components/states/frontComponentExternalLinkModalConfigState';
import { trustedFrontComponentExternalOriginsState } from '@/front-components/states/trustedFrontComponentExternalOriginsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const mockOpenModal = jest.fn();

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: jest.fn(),
    toggleModal: jest.fn(),
  }),
}));

const APPLICATION_ID = 'application-1';

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderRequestNavigation = () =>
  renderHook(
    () =>
      useRequestFrontComponentExternalNavigation({
        applicationId: APPLICATION_ID,
      }),
    { wrapper },
  );

describe('useRequestFrontComponentExternalNavigation', () => {
  const originalWindowOpen = window.open;

  beforeEach(() => {
    mockOpenModal.mockClear();
    window.open = jest.fn();
    jotaiStore.set(trustedFrontComponentExternalOriginsState.atom, {});
    jotaiStore.set(frontComponentExternalLinkModalConfigState.atom, null);
  });

  afterEach(() => {
    window.open = originalWindowOpen;
  });

  it('should open the confirmation modal for an untrusted origin', () => {
    const { result } = renderRequestNavigation();

    act(() => {
      result.current({ url: 'https://example.com/pricing', target: undefined });
    });

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(
      jotaiStore.get(frontComponentExternalLinkModalConfigState.atom),
    ).toEqual({
      applicationId: APPLICATION_ID,
      url: 'https://example.com/pricing',
      origin: 'https://example.com',
      target: undefined,
    });
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should navigate directly when the origin is already trusted by the application', () => {
    jotaiStore.set(trustedFrontComponentExternalOriginsState.atom, {
      [APPLICATION_ID]: ['https://example.com'],
    });

    const { result } = renderRequestNavigation();

    act(() => {
      result.current({ url: 'https://example.com/pricing', target: '_blank' });
    });

    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/pricing',
      '_blank',
      'noopener,noreferrer',
    );
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it('should not reuse trust granted to a different application', () => {
    jotaiStore.set(trustedFrontComponentExternalOriginsState.atom, {
      'other-application': ['https://example.com'],
    });

    const { result } = renderRequestNavigation();

    act(() => {
      result.current({ url: 'https://example.com/pricing', target: undefined });
    });

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(window.open).not.toHaveBeenCalled();
  });
});
