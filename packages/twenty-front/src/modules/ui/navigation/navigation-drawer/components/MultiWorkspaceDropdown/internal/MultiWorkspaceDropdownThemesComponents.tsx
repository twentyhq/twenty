import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { IconCheck, IconChevronLeft, MenuItem } from 'twenty-ui';
import { useLingui } from '@lingui/react/macro';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useSetRecoilState } from 'recoil';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme, colorSchemeList } = useColorScheme();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  return (
    <DropdownMenuItemsContainer>
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
      {colorSchemeList.map((theme) => (
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
