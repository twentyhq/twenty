import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { ViewFieldsHiddenDropdownSection } from '@/views/components/ViewFieldsHiddenDropdownSection';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const ObjectOptionsDropdownHiddenFieldsContent = () => {
  const { t } = useLingui();
  const { objectMetadataItem, onContentChange, closeDropdown } =
    useObjectOptionsDropdown();

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const settingsUrl = getSettingsPath(SettingsPath.ObjectDetail, {
    objectNamePlural,
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('fields')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Hidden Fields`}
      </DropdownMenuHeader>
      <ViewFieldsHiddenDropdownSection />
      <DropdownMenuSeparator />
      <UndecoratedLink
        to={settingsUrl}
        onClick={() => {
          setNavigationMemorizedUrl(location.pathname + location.search);
          closeDropdown();
        }}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <ListItem startIcon={<IconSettings />}>{t`Edit Fields`}</ListItem>
        </DropdownMenuItemsContainer>
      </UndecoratedLink>
    </LegacyDropdownContent>
  );
};
