import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useIsMobile } from 'twenty-ui/utilities';

import { useHasAiChatSectionInSidebar } from '@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

jest.mock('@/navigation-menu-item/display/hooks/useHasAiChatSectionInSidebar');
jest.mock('@/settings/roles/hooks/useHasPermissionFlag');
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));
jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: jest.fn(),
}));

const renderUseCanCustomizeSidebar = (pathname: string) =>
  renderHook(() => useCanCustomizeSidebar(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={createStore()}>
        <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
      </Provider>
    ),
  });

describe('useCanCustomizeSidebar', () => {
  beforeEach(() => {
    jest.mocked(useIsMobile).mockReturnValue(false);
    jest.mocked(useIsFeatureEnabled).mockReturnValue(true);
    jest.mocked(useHasPermissionFlag).mockReturnValue(true);
    jest.mocked(useHasAiChatSectionInSidebar).mockReturnValue(true);
  });

  it.each([
    ['/objects/companies', true],
    ['/inbox', true],
    ['/inbox/20202020-0000-4000-8000-000000000014', true],
    ['/chat/20202020-0000-4000-8000-000000000014', true],
    ['/settings/profile', false],
    ['/agents', false],
    ['/agent/20202020-0000-4000-8000-000000000014', false],
  ])(
    'allows customizing the sidebar on %s: %s',
    (pathname, expectedCanCustomizeSidebar) => {
      const { result } = renderUseCanCustomizeSidebar(pathname);

      expect(result.current).toBe(expectedCanCustomizeSidebar);
    },
  );

  it.each(['/inbox', '/chat/20202020-0000-4000-8000-000000000014'])(
    'does not allow customizing the sidebar on %s when the drawer lists the chat history',
    (pathname) => {
      jest.mocked(useHasAiChatSectionInSidebar).mockReturnValue(false);

      const { result } = renderUseCanCustomizeSidebar(pathname);

      expect(result.current).toBe(false);
    },
  );
});
