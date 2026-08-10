import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
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
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
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

// Selectable list items are full height by default, which spreads them over
// the rail once it has one. Keeping them in an auto-height list leaves each row
// at its own height.
const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
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

  // A fresh array each render would make the selectable list rewrite its ids
  // on every render, which is how these lists tip into an update loop.
  const selectableItemIds = useMemo(
    () => [
      ALL_OBJECTS_ITEM_ID,
      ...objectMetadataItems.map((objectMetadataItem) => objectMetadataItem.id),
    ],
    [objectMetadataItems],
  );

  const { setSelectedItemId } = useSelectableList(
    SEARCH_PAGE_OBJECT_FILTER_SELECTABLE_LIST_ID,
  );

  const handleFocus = () => {
    // Start the keyboard cursor on the filter that is actually applied, so the
    // first arrow key moves away from it rather than back to the top.
    setSelectedItemId(
      objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === selectedObjectNameSingular,
      )?.id ?? ALL_OBJECTS_ITEM_ID,
    );

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
        <StyledList>
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
        </StyledList>
      </SelectableList>
    </StyledContainer>
  );
};
