import { useEffect } from 'react';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import {
  MenuItem,
  MenuItemSelect,
  UndecoratedLink,
} from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
  } = useObjectOptionsDropdown();

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const hiddenRecordGroupIds = useRecoilComponentValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
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
    <DropdownContent>
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
      <DropdownMenuSeparator />
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
    </DropdownContent>
  );
};
