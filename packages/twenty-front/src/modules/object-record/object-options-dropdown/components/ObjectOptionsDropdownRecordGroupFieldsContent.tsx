import { useEffect } from 'react';
import {
  IconChevronLeft,
  IconSettings,
  MenuItem,
  UndecoratedLink,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

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

  const { hiddenRecordGroups } = useRecordGroups({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const {
    recordGroupFieldSearchInput,
    setRecordGroupFieldSearchInput,
    filteredRecordGroupFieldMetadataItems,
  } = useSearchRecordGroupField();

  const { handleRecordGroupFieldChange, resetRecordGroupField } =
    useHandleRecordGroupField({
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
        <MenuItem text="None" onClick={resetRecordGroupField} />
        {filteredRecordGroupFieldMetadataItems.map((fieldMetadataItem) => (
          <MenuItem
            key={fieldMetadataItem.id}
            onClick={() => {
              handleRecordGroupFieldChange(fieldMetadataItem);
            }}
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
