import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { IconChevronLeft } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme, colorSchemeList } = useColorScheme();

  const setMultiWorkspaceDropdown = useSetAtomState(
    multiWorkspaceDropdownState,
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setMultiWorkspaceDropdown('default')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Theme`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {colorSchemeList.map((theme) => (
          <ListItem
            key={theme.id}
            startIcon={<SelectOptionIcon Icon={theme.icon} />}
            onClick={getDropdownMenuItemClickHandler(() =>
              setColorScheme(theme.id),
            )}
            role="option"
            aria-selected={theme.id === colorScheme}
            indicator="check"
            selected={theme.id === colorScheme}
          >
            <OverflowingTextWithTooltip
              text={
                theme.id === 'System'
                  ? t`System`
                  : theme.id === 'Dark'
                    ? t`Dark`
                    : t`Light`
              }
            />
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
