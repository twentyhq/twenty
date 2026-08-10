import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { TintedIconTile } from 'twenty-ui/data-display';
import { IconCube } from 'twenty-ui/icon';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SEARCH_PAGE_OBJECT_FILTER_FOCUS_ID } from '@/search/constants/SearchPageObjectFilterFocusId';
import { SEARCH_PAGE_OBJECT_FILTER_SELECTABLE_LIST_ID } from '@/search/constants/SearchPageObjectFilterSelectableListId';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const ALL_OBJECTS_ITEM_ID = 'all-objects';

// Tabbing into the rail hands it the arrow keys; they go back to the results
// list on blur, so the two lists never compete for them.
const StyledContainer = styled.nav`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  width: 200px;

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }
`;

const StyledHeading = styled.div`
  padding: ${themeCssVariables.spacing[1]};
  user-select: none;
`;

type SearchPageObjectFilterListProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SearchPageObjectFilterList = ({
  objectMetadataItems,
  selectedObjectNameSingular,
  onSelectObject,
}: SearchPageObjectFilterListProps) => {
  const { t } = useLingui();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    SEARCH_PAGE_OBJECT_FILTER_SELECTABLE_LIST_ID,
  );

  const selectableItemIds = [
    ALL_OBJECTS_ITEM_ID,
    ...objectMetadataItems.map((objectMetadataItem) => objectMetadataItem.id),
  ];

  const handleFocus = () => {
    pushFocusItemToFocusStack({
      focusId: SEARCH_PAGE_OBJECT_FILTER_FOCUS_ID,
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId: SEARCH_PAGE_OBJECT_FILTER_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({
      focusId: SEARCH_PAGE_OBJECT_FILTER_FOCUS_ID,
    });
  };

  return (
    <StyledContainer
      role="listbox"
      aria-label={t`Filter by object`}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <StyledHeading>
        <Label>{t`Object`}</Label>
      </StyledHeading>
      <SelectableList
        selectableListInstanceId={SEARCH_PAGE_OBJECT_FILTER_SELECTABLE_LIST_ID}
        focusId={SEARCH_PAGE_OBJECT_FILTER_FOCUS_ID}
        selectableItemIdArray={selectableItemIds}
      >
        <SelectableListItem
          itemId={ALL_OBJECTS_ITEM_ID}
          onEnter={() => onSelectObject(null)}
        >
          <MenuItemSelectAvatar
            avatar={<TintedIconTile Icon={IconCube} />}
            text={t`All objects`}
            selected={selectedObjectNameSingular === null}
            focused={selectedItemId === ALL_OBJECTS_ITEM_ID}
            onClick={() => onSelectObject(null)}
          />
        </SelectableListItem>
        {objectMetadataItems.map((objectMetadataItem) => (
          <SelectableListItem
            key={objectMetadataItem.id}
            itemId={objectMetadataItem.id}
            onEnter={() => onSelectObject(objectMetadataItem.nameSingular)}
          >
            <MenuItemSelectAvatar
              avatar={
                <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
              }
              text={objectMetadataItem.labelPlural}
              selected={
                selectedObjectNameSingular === objectMetadataItem.nameSingular
              }
              focused={selectedItemId === objectMetadataItem.id}
              onClick={() => onSelectObject(objectMetadataItem.nameSingular)}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </StyledContainer>
  );
};
