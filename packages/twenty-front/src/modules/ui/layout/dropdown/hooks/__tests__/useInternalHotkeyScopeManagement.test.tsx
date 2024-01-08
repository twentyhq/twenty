import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useInternalHotkeyScopeManagement } from '@/ui/layout/dropdown/hooks/useInternalHotkeyScopeManagement';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

const dropdownScopeId = 'testId';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <DropdownScope dropdownScopeId={dropdownScopeId}>
        {children}
      </DropdownScope>
    </RecoilRoot>
  );
};

describe('useInternalHotkeyScopeManagement', () => {
  it('should update dropdownHotkeyScope', async () => {
    const { result, rerender } = renderHook(
      ({
        dropdownHotkeyScopeFromParent,
      }: {
        dropdownHotkeyScopeFromParent?: HotkeyScope;
      }) => {
        useInternalHotkeyScopeManagement({ dropdownHotkeyScopeFromParent });
        const { dropdownHotkeyScope } = useDropdown();
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
