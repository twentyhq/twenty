import { useEffect } from 'react';
import {
  IconChevronLeft,
  IconSettings,
  MenuItem,
  MenuItemSelect,
  UndecoratedLink,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const ObjectOptionsDropdownRecordGroupFieldsContent = () => {
  const { getIcon } = useIcons();

  const {
    currentContentId,
    recordIndexId,
    objectMetadataItem,
    onContentChange,
    closeDropdown,
  } = useOptionsDropdown();

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordGroupFieldMetadataItem = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const {
    recordGroupFieldSearchInput,
    setRecordGroupFieldSearchInput,
    filteredRecordGroupFieldMetadataItems,
  } = useSearchRecordGroupField();

  const {
    handleRecordGroupFieldChange: setRecordGroupField,
    resetRecordGroupField,
  } = useHandleRecordGroupField({
    viewBarComponentId: recordIndexId,
  });

  const newFieldSettingsUrl = getSettingsPagePath(
    SettingsPath.ObjectNewFieldSelect,
    {
      objectSlug: objectNamePlural,
    },
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const handleResetRecordGroupField = () => {
    resetRecordGroupField();
    closeDropdown();
  };

  const handleRecordGroupFieldChange = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    setRecordGroupField(fieldMetadataItem);
    closeDropdown();
  };

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
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={() => onContentChange('recordGroups')}
      >
        Group by
      </DropdownMenuHeader>
      <StyledInput
        autoFocus
        value={recordGroupFieldSearchInput}
        placeholder="Search fields"
        onChange={(event) => setRecordGroupFieldSearchInput(event.target.value)}
      />
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          text="None"
          selected={!isDefined(recordGroupFieldMetadataItem)}
          onClick={handleResetRecordGroupField}
        />
        {filteredRecordGroupFieldMetadataItems.map((fieldMetadataItem) => (
          <MenuItemSelect
            key={fieldMetadataItem.id}
            selected={fieldMetadataItem.id === recordGroupFieldMetadataItem?.id}
            onClick={() => handleRecordGroupFieldChange(fieldMetadataItem)}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <UndecoratedLink
          to={newFieldSettingsUrl}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
            closeDropdown();
          }}
        >
          <MenuItem LeftIcon={IconSettings} text="Create select field" />
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </>
  );
};
