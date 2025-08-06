import { useEffect } from 'react';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { IconChevronLeft, IconSettings } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const ObjectOptionsDropdownHiddenRecordGroupsContent = () => {
  const { t } = useLingui();
  const {
    viewType,
    currentContentId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
  } = useObjectOptionsDropdown();

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const hiddenRecordGroupIds = useRecoilComponentValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
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
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('recordGroups')}
            Icon={IconChevronLeft}
          />
        }
      >
        Hidden {recordGroupFieldMetadata?.label}
      </DropdownMenuHeader>
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
          <MenuItem LeftIcon={IconSettings} text={t`Edit field values`} />
        </DropdownMenuItemsContainer>
      </UndecoratedLink>
    </DropdownContent>
  );
};
