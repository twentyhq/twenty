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
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const ObjectOptionsDropdownHiddenRecordGroupsContent = () => {
  const {
    viewType,
    currentContentId,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
  } = useOptionsDropdown();

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
      viewType,
    });

  const viewGroupSettingsUrl = getSettingsPath(SettingsPath.ObjectFieldEdit, {
    objectNamePlural,
    fieldName: recordGroupFieldMetadata?.name ?? '',
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  return (
    <>
      <DropdownMenuItemsContainer>
        <DropdownMenuHeader
          StartIcon={IconChevronLeft}
          onClick={() => onContentChange('recordGroups')}
        >
          Hidden {recordGroupFieldMetadata?.label}
        </DropdownMenuHeader>
      </DropdownMenuItemsContainer>

      <RecordGroupsVisibilityDropdownSection
        title={`Hidden ${recordGroupFieldMetadata?.label}`}
        recordGroupIds={hiddenRecordGroupIds}
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
