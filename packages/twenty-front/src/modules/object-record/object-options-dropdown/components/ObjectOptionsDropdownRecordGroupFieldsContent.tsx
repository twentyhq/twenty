import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { useEffect } from 'react';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { isRecordGroupingOptionalForViewType } from '@/object-record/record-group/utils/isRecordGroupingOptionalForViewType';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/icon';
import { ListItem, UndecoratedLink } from 'twenty-ui/primitives/navigation';
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

  const hiddenRecordGroupIds = useAtomComponentSelectorValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
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
  const setNavigationMemorizedUrl = useSetAtomState(
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
              isDefined(recordIndexGroupFieldMetadataItem)
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
        {isRecordGroupingOptionalForViewType(viewType) && (
          <ListItem
            onClick={handleResetRecordGroupField}
            role="option"
            aria-selected={!isDefined(recordIndexGroupFieldMetadataItem)}
            selected={!isDefined(recordIndexGroupFieldMetadataItem)}
            indicator="check"
          >
            <OverflowingTextWithTooltip text={t`None`} />
          </ListItem>
        )}
        {filteredRecordGroupFieldMetadataItems.map((fieldMetadataItem) => (
          <ListItem
            key={fieldMetadataItem.id}
            onClick={() => handleRecordGroupFieldChange(fieldMetadataItem)}
            role="option"
            aria-selected={
              fieldMetadataItem.id === recordIndexGroupFieldMetadataItem?.id
            }
            selected={
              fieldMetadataItem.id === recordIndexGroupFieldMetadataItem?.id
            }
            indicator="check"
            startIcon={
              <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
            }
          >
            <OverflowingTextWithTooltip text={fieldMetadataItem.label} />
          </ListItem>
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
          <ListItem startIcon={<IconSettings />}>
            <OverflowingTextWithTooltip text={t`Create select field`} />
          </ListItem>
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
