import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { ViewFieldsHiddenDropdownSection } from '@/views/components/ViewFieldsHiddenDropdownSection';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

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
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  return (
    <DropdownContent>
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
          <MenuItem LeftIcon={IconSettings} text={t`Edit Fields`} />
        </DropdownMenuItemsContainer>
      </UndecoratedLink>
    </DropdownContent>
  );
};
