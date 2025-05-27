import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { IconCheck, IconChevronLeft } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme, colorSchemeList } = useColorScheme();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setMultiWorkspaceDropdownState('default')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Theme`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {colorSchemeList.map((theme) => (
          <MenuItem
            key={theme.id}
            LeftIcon={theme.icon}
            /* eslint-disable-next-line lingui/no-expression-in-message */
            text={t`${theme.id}`}
            onClick={() => setColorScheme(theme.id)}
            RightIcon={theme.id === colorScheme ? IconCheck : undefined}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
