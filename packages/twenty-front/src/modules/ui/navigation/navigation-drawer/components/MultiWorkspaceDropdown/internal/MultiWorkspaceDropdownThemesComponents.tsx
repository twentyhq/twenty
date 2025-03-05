import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import {
  IconCheck,
  IconChevronLeft,
  IconComponent,
  IconMoon,
  IconSun,
  IconSunMoon,
  MenuItem,
} from 'twenty-ui';
import { useLingui } from '@lingui/react/macro';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useSetRecoilState } from 'recoil';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme } = useColorScheme();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const themesList: Array<{
    id: ColorScheme;
    icon: IconComponent;
  }> = [
    {
      id: 'System',
      icon: IconSunMoon,
    },
    {
      id: 'Dark',
      icon: IconMoon,
    },
    {
      id: 'Light',
      icon: IconSun,
    },
  ];

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onStartIconClick={() => setMultiWorkspaceDropdownState('default')}
      >
        {t`Theme`}
      </DropdownMenuHeader>
      {themesList.map((theme) => (
        <MenuItem
          LeftIcon={theme.icon}
          /* eslint-disable-next-line lingui/no-expression-in-message */
          text={t`${theme.id}`}
          onClick={() => setColorScheme(theme.id)}
          RightIcon={theme.id === colorScheme ? IconCheck : undefined}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
