import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OPEN_RECORD_IN_OPTIONS } from '@/ui/navigation/navigation-drawer/constants/OpenRecordInOptions';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { OpenRecordIn } from 'twenty-shared/types';
import { IconChevronLeft } from 'twenty-ui/icon';

export const MultiWorkspaceDropdownOpenRecordInComponents = () => {
  const { t } = useLingui();

  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

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
        {t`Open records in`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {Object.values(OpenRecordIn).map((openRecordIn) => (
          <ListItem
            key={openRecordIn}
            startIcon={
              <SelectOptionIcon
                Icon={OPEN_RECORD_IN_OPTIONS[openRecordIn].Icon}
              />
            }
            onClick={() => setOpenRecordInPreference(openRecordIn)}
            role="option"
            aria-selected={openRecordIn === openRecordInPreference}
            indicator="check"
            selected={openRecordIn === openRecordInPreference}
          >
            {t(OPEN_RECORD_IN_OPTIONS[openRecordIn].label)}
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
