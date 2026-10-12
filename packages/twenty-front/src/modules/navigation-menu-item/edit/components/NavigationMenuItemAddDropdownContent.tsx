import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemInsertionPreviewEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemInsertionPreviewEffect';
import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import { type NavigationMenuItemAddStep } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddStep';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  useNavigationMenuItemEditController,
  type NewNavigationMenuItemInput,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { normalizeSearchText } from 'twenty-ui/utilities';

const VIEW_OBJECT_PAGE = 'view-object';

type Step = NavigationMenuItemAddStep;

const STEP_BY_PAGE: Partial<Record<string, Step>> = {
  object: 'object',
  view: 'view',
  [VIEW_OBJECT_PAGE]: 'view',
  record: 'record',
  page: 'page',
};

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
  const { page = 'root', goToPage } = useDropdownPage();
  const step = STEP_BY_PAGE[page] ?? 'main';
  const [search, setSearch] = useState('');
  const isSearchingAllItems =
    step === 'main' && isNonEmptyString(search.trim());
  const [objectId, setObjectId] = useState<string | null>(null);
  const { currentItems, createItem } =
    useNavigationMenuItemEditController(section);
  const insertionIndex =
    position ??
    currentItems.filter(
      (item) => (item.folderId ?? null) === (folderId ?? null),
    ).length;

  const navigate = (next: Step) => {
    goToPage(next);
    setSearch('');
    setObjectId(null);
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
      goToPage(VIEW_OBJECT_PAGE);
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
    <>
      <NavigationMenuItemInsertionPreviewEffect
        dropdownId={dropdownId}
        section={section}
        folderId={folderId ?? null}
        index={insertionIndex}
      />
      <Dropdown.Page id={page} type="picker">
        {step === 'main' ? (
          <Dropdown.Header>
            <Dropdown.Title>{titles[step]}</Dropdown.Title>
            <Dropdown.Close aria-label={t`Close`} />
          </Dropdown.Header>
        ) : (
          <Dropdown.Back
            onClick={() => {
              setSearch('');
              setObjectId(null);
            }}
          >
            {titles[step]}
          </Dropdown.Back>
        )}
        <Dropdown.Search
          key={`search-${page}`}
          autoFocus
          value={search}
          onValueChange={setSearch}
          placeholder={step === 'record' ? t`Search records...` : t`Search...`}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {groups
            .filter((group) => isNonEmptyArray(group.items))
            .map((group) => (
              <Dropdown.Section
                key={group.label}
                label={isNonEmptyString(group.label) ? group.label : undefined}
              >
                {group.items.map((item) => (
                  <NavigationMenuItemSelectableItem key={item.id} item={item} />
                ))}
              </Dropdown.Section>
            ))}
          {!isNonEmptyArray(items) && (
            <Dropdown.Empty>{emptyMessage}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
