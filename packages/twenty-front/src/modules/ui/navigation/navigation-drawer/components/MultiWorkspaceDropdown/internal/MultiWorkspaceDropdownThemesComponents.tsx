import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import {
  IconChevronLeft,
  IconMoon,
  IconSun,
  IconSunMoon,
  MenuItem,
} from 'twenty-ui';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useLingui } from '@lingui/react/macro';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useSetRecoilState } from 'recoil';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme } = useColorScheme();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  return (
    <DropdownMenuItemsContainer>
      <MenuItem
        LeftIcon={IconChevronLeft}
        text={t`Theme`}
        onClick={() => setMultiWorkspaceDropdownState('default')}
      />
      <DropdownMenuSeparator />
      <MenuItem
        LeftIcon={IconSunMoon}
        text={t`System`}
        onClick={() => setColorScheme('System')}
      />
      <MenuItem
        LeftIcon={IconMoon}
        text={t`Dark`}
        onClick={() => setColorScheme('Dark')}
      />
      <MenuItem
        LeftIcon={IconSun}
        text={t`Light`}
        onClick={() => setColorScheme('Light')}
      />
    </DropdownMenuItemsContainer>
  );
};
