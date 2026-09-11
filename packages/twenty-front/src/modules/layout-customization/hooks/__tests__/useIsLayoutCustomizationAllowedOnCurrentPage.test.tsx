import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';

describe('useIsLayoutCustomizationAllowedOnCurrentPage', () => {
  it.each([
    ['/chat', false],
    ['/chat/20202020-0000-4000-8000-000000000014', false],
    ['/settings/profile', false],
    ['/settings/objects/companies', false],
    ['/object/companies', true],
    ['/object/company/20202020-0000-4000-8000-000000000014', true],
  ])('allows layout customization on %s: %s', (pathname, expected) => {
    const { result } = renderHook(
      () => useIsLayoutCustomizationAllowedOnCurrentPage(),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
        ),
      },
    );

    expect(result.current).toBe(expected);
  });
});
