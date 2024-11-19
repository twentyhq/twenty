import { useEffect } from 'react';
import {
  IconChevronLeft,
  IconSettings,
  MenuItem,
  UndecoratedLink,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const ObjectOptionsDropdownHiddenRecordGroupsContent = () => {
  const {
    currentContentId,
    viewType,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
  } = useOptionsDropdown();

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { hiddenRecordGroups, viewGroupFieldMetadataItem } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
      viewType,
    });

  const viewGroupSettingsUrl = getSettingsPagePath(
    SettingsPath.ObjectFieldEdit,
    {
      objectSlug: objectNamePlural,
      fieldSlug: viewGroupFieldMetadataItem?.name ?? '',
    },
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroups.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroups, currentContentId, onContentChange]);

  return (
    <>
      <DropdownMenuItemsContainer>
        <DropdownMenuHeader
          StartIcon={IconChevronLeft}
          onClick={() => onContentChange('recordGroups')}
        >
          Hidden {viewGroupFieldMetadataItem?.label}
        </DropdownMenuHeader>
      </DropdownMenuItemsContainer>

      <RecordGroupsVisibilityDropdownSection
        title={`Hidden ${viewGroupFieldMetadataItem?.label}`}
        recordGroups={hiddenRecordGroups}
        onVisibilityChange={handleRecordGroupVisibilityChange}
        isDraggable={false}
        showSubheader={false}
        showDragGrip={false}
      />
      <DropdownMenuSeparator />
      <UndecoratedLink
        to={viewGroupSettingsUrl}
        onClick={() => {
          setNavigationMemorizedUrl(location.pathname + location.search);
          closeDropdown();
        }}
      >
        <DropdownMenuItemsContainer>
          <MenuItem LeftIcon={IconSettings} text="Edit field values" />
        </DropdownMenuItemsContainer>
      </UndecoratedLink>
    </>
  );
};
