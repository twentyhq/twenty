import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useDropdownStates } from '@/ui/layout/dropdown/hooks/internal/useDropdownStates';
import { useInternalHotkeyScopeManagement } from '@/ui/layout/dropdown/hooks/useInternalHotkeyScopeManagement';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

const dropdownScopeId = 'test-dropdown-id-scope';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

describe('useInternalHotkeyScopeManagement', () => {
  it('should update dropdownHotkeyScope', async () => {
    const { result, rerender } = renderHook(
      ({
        dropdownHotkeyScopeFromParent,
      }: {
        dropdownHotkeyScopeFromParent?: HotkeyScope;
      }) => {
        useInternalHotkeyScopeManagement({
          dropdownScopeId,
          dropdownHotkeyScopeFromParent,
        });
        const { dropdownHotkeyScopeState } = useDropdownStates({
          dropdownScopeId,
        });
        const dropdownHotkeyScope = useRecoilValue(dropdownHotkeyScopeState);
        return { dropdownHotkeyScope };
      },
      {
        wrapper: Wrapper,
        initialProps: {},
      },
    );

    expect(result.current.dropdownHotkeyScope).toBeNull();

    const scopeFromParent = { scope: 'customScope' };

    rerender({ dropdownHotkeyScopeFromParent: scopeFromParent });

    expect(result.current.dropdownHotkeyScope).toEqual(scopeFromParent);
  });
});
