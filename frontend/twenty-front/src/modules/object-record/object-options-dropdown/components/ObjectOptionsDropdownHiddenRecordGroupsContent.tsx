import { useEffect } from 'react';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { RecordGroupsVisibilityDropdownSection } from '@/object-record/record-group/components/RecordGroupsVisibilityDropdownSection';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings } from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownHiddenRecordGroupsContent = () => {
  const { t } = useLingui();
  const {
    currentContentId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
    viewType,
  } = useObjectOptionsDropdown();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const hiddenRecordGroupIds = useAtomComponentSelectorValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const isVisibleLimitReached =
    visibleRecordGroupIds.length >= VIEW_GROUP_VISIBLE_OPTIONS_MAX;

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility();

  const viewGroupSettingsUrl = getSettingsPath(SettingsPath.ObjectFieldEdit, {
    objectNamePlural,
    fieldName: recordIndexGroupFieldMetadataItem?.name ?? '',
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetAtomState(
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
        {t`Hidden`} {recordIndexGroupFieldMetadataItem?.label}
      </DropdownMenuHeader>
      <RecordGroupsVisibilityDropdownSection
        title={`${t`Hidden`} ${recordIndexGroupFieldMetadataItem?.label}`}
        recordGroupIds={hiddenRecordGroupIds}
        onVisibilityChange={handleRecordGroupVisibilityChange}
        isDraggable={false}
        showSubheader={false}
        showDragGrip={false}
        isVisibleLimitReached={isVisibleLimitReached}
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
