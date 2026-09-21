import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemInsertionPreviewEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemInsertionPreviewEffect';
import {
  useNavigationMenuItemAddOptions,
  type NavigationMenuItemAddStep,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import {
  NavigationMenuItemSelectableItem,
  type NavigationMenuItemOption,
} from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Fragment, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconX } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import {
  useNavigationMenuItemEditController,
  type NewNavigationMenuItemInput,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type Step = NavigationMenuItemAddStep;
type NavigationMenuItemAddDropdownContentProps = {
  dropdownId: string;
  section: NavigationMenuItemSection;
  folderId?: string;
  position?: number;
  onClose: () => void;
};

export const NavigationMenuItemAddDropdownContent = ({
  dropdownId,
  section,
  folderId,
  position,
  onClose,
}: NavigationMenuItemAddDropdownContentProps) => {
  const { t } = useLingui();
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const [step, setStep] = useState<Step>('main');
  const [search, setSearch] = useState('');
  const isSearchingAllItems = step === 'main' && search.trim().length > 0;
  const [objectId, setObjectId] = useState<string | null>(null);
  const { currentItems, createItem } =
    useNavigationMenuItemEditController(section);
  const insertionIndex =
    position ??
    currentItems.filter(
      (item) => (item.folderId ?? null) === (folderId ?? null),
    ).length;

  const navigate = (next: Step) => {
    setStep(next);
    setSearch('');
    setObjectId(null);
  };
  const goBack = () => {
    setSearch('');
    if (isDefined(objectId)) {
      setObjectId(null);
    } else {
      setStep('main');
    }
  };
  const addItem = (input: NewNavigationMenuItemInput) => {
    const itemId = createItem(input, {
      targetFolderId: folderId ?? null,
      targetIndex: position,
    });
    onClose();
    setSelectedNavigationMenuItemIdInEditMode(itemId);
    if (input.type === NavigationMenuItemType.FOLDER) {
      setNavigationMenuItemIdToRename(itemId);
    }
  };
  const {
    getItems,
    standalonePagesLoading,
    standalonePagesError,
    recordSearchLoading,
    isSearchDebouncing,
  } = useNavigationMenuItemAddOptions({
    step,
    search,
    objectId,
    folderId,
    currentItems,
    isSearchingAllItems,
    addItem,
    navigateToStep: navigate,
    selectObject: (nextObjectId) => {
      setObjectId(nextObjectId);
      setSearch('');
    },
  });

  const titles: Record<Step, string> = {
    main: t`Add menu item`,
    object: t`Object`,
    view: t`View`,
    record: t`Record`,
    page: t`Page`,
  };

  const normalizedSearch = normalizeSearchText(search.trim());
  const matchesSearch = (item: NavigationMenuItemOption) =>
    (item.searchableValues ?? [item.label]).some((value) =>
      normalizeSearchText(value).includes(normalizedSearch),
    );
  const groups = isSearchingAllItems
    ? [
        { label: t`Objects`, items: getItems('object').filter(matchesSearch) },
        { label: t`Views`, items: getItems('view').filter(matchesSearch) },
        { label: t`Pages`, items: getItems('page').filter(matchesSearch) },
        {
          label: t`Records`,
          items: isSearchDebouncing ? [] : getItems('record'),
        },
        {
          label: t`Other`,
          items: getItems('main').filter(
            (item) =>
              (item.id === 'folder' || item.id === 'link') &&
              matchesSearch(item),
          ),
        },
      ]
    : [
        {
          label: '',
          items: getItems().filter(
            (item) => step === 'record' || matchesSearch(item),
          ),
        },
      ];
  const items = groups.flatMap((group) => group.items);
  const getEmptyMessage = () => {
    if (step === 'page' && isDefined(standalonePagesError)) {
      return t`Couldn't load pages`;
    }

    if (
      (step === 'record' || isSearchingAllItems) &&
      (recordSearchLoading || isSearchDebouncing)
    ) {
      return t`Loading...`;
    }

    if ((step === 'page' || isSearchingAllItems) && standalonePagesLoading) {
      return t`Loading...`;
    }

    return t`No results found`;
  };

  const emptyMessage = getEmptyMessage();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <NavigationMenuItemInsertionPreviewEffect
        dropdownId={dropdownId}
        section={section}
        folderId={folderId ?? null}
        index={insertionIndex}
      />
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Icon={step === 'main' ? IconX : IconChevronLeft}
            onClick={step === 'main' ? onClose : goBack}
          />
        }
      >
        {titles[step]}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        key={`search-${step}-${objectId}`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={step === 'record' ? t`Search records...` : t`Search...`}
      />
      <DropdownMenuSeparator />
      <SelectableList
        key={`${step}-${objectId}`}
        selectableListInstanceId={`${dropdownId}-list`}
        focusId={dropdownId}
        selectableItemIdArray={items
          .filter((item) => !item.isDisabled)
          .map((item) => item.id)}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <Fragment key={group.label}>
                {isNonEmptyString(group.label) && (
                  <DropdownMenuSectionLabel label={group.label} />
                )}
                {group.items.map((item) => (
                  <NavigationMenuItemSelectableItem key={item.id} item={item} />
                ))}
              </Fragment>
            ))}
          {items.length === 0 && (
            <ListItem disabled>
              <OverflowingTextWithTooltip text={emptyMessage} />
            </ListItem>
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
