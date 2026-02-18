import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { multiWorkspaceDropdownStateV2 } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownStateV2';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useLingui } from '@lingui/react/macro';
import { IconCheck, IconChevronLeft } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme, colorSchemeList } = useColorScheme();

  const setMultiWorkspaceDropdownState = useSetRecoilStateV2(
    multiWorkspaceDropdownStateV2,
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
            text={
              theme.id === 'System'
                ? t`System`
                : theme.id === 'Dark'
                  ? t`Dark`
                  : t`Light`
            }
            onClick={() => setColorScheme(theme.id)}
            RightIcon={theme.id === colorScheme ? IconCheck : undefined}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
