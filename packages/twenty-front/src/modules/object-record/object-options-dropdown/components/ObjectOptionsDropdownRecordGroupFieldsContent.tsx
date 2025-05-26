import { useEffect } from 'react';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import {
  MenuItem,
  MenuItemSelect,
  UndecoratedLink,
} from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const ObjectOptionsDropdownRecordGroupFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const {
    viewType,
    currentContentId,
    objectMetadataItem,
    onContentChange,
    resetContent,
    closeDropdown,
  } = useOptionsDropdown();

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
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
  } = useHandleRecordGroupField();

  const newSelectFieldSettingsUrl = getSettingsPath(
    SettingsPath.ObjectNewFieldConfigure,
    {
      objectNamePlural,
    },
    {
      fieldType: FieldMetadataType.SELECT,
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
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() =>
              isDefined(recordGroupFieldMetadata)
                ? onContentChange('recordGroups')
                : resetContent()
            }
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Group by`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={recordGroupFieldSearchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setRecordGroupFieldSearchInput(event.target.value)}
      />
      <DropdownMenuItemsContainer>
        {viewType === ViewType.Table && (
          <MenuItemSelect
            text={t`None`}
            selected={!isDefined(recordGroupFieldMetadata)}
            onClick={handleResetRecordGroupField}
          />
        )}
        {filteredRecordGroupFieldMetadataItems.map((fieldMetadataItem) => (
          <MenuItemSelect
            key={fieldMetadataItem.id}
            selected={fieldMetadataItem.id === recordGroupFieldMetadata?.id}
            onClick={() => handleRecordGroupFieldChange(fieldMetadataItem)}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <UndecoratedLink
          to={newSelectFieldSettingsUrl}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
            closeDropdown();
          }}
        >
          <MenuItem LeftIcon={IconSettings} text={t`Create select field`} />
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </>
  );
};
