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
import { Fragment, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  useNavigationMenuItemEditController,
  type NewNavigationMenuItemInput,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { normalizeSearchText } from 'twenty-ui/utilities';
import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';

const VIEW_OBJECT_PAGE = 'view-object';
const SETTINGS_PAGE_TABS_PAGE = 'settings-page';

type Step = NavigationMenuItemAddStep;

const STEP_BY_PAGE: Partial<Record<string, Step>> = {
  object: 'object',
  view: 'view',
  [VIEW_OBJECT_PAGE]: 'view',
  record: 'record',
  page: 'page',
  settings: 'settings',
  [SETTINGS_PAGE_TABS_PAGE]: 'settings-page',
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
  const [settingsPageLink, setSettingsPageLink] = useState<string | null>(null);
  const { currentItems, createItem } =
    useNavigationMenuItemEditController(section);
  const insertionIndex =
    position ??
    currentItems.filter(
      (item) =>
        (item.folderId ?? null) === (folderId ?? null) &&
        !isNavigationMenuItemTabOrSection(item),
    ).length;

  const navigate = (next: Step) => {
    goToPage(next);
    setSearch('');
    setObjectId(null);
    setSettingsPageLink(null);
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
    getSettingsGroups,
    getSettingsSearchItems,
    standalonePagesLoading,
    standalonePagesError,
    recordSearchLoading,
    isSearchDebouncing,
  } = useNavigationMenuItemAddOptions({
    step,
    search,
    objectId,
    settingsPageLink,
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
    selectSettingsPage: (nextSettingsPageLink) => {
      setSettingsPageLink(nextSettingsPageLink);
      setSearch('');
      goToPage(SETTINGS_PAGE_TABS_PAGE);
    },
  });

  const settingsPageTitle = getSettingsGroups()
    .flatMap((group) => group.items)
    .find((item) => item.id === settingsPageLink)?.label;

  const titles: Record<Step, string> = {
    main: t`Add menu item`,
    object: t`Object`,
    view: t`View`,
    record: t`Record`,
    page: t`Page`,
    settings: t`Settings`,
    'settings-page': settingsPageTitle ?? t`Settings`,
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
          label: t`Settings`,
          items: getSettingsSearchItems().filter(matchesSearch),
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
    : step === 'settings'
      ? getSettingsGroups().map((group) => ({
          label: group.label,
          items: group.items.filter(matchesSearch),
        }))
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
              setSettingsPageLink(null);
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
        <Dropdown.Section scrollable={step !== 'main' || isSearchingAllItems}>
          {groups
            .filter((group) => isNonEmptyArray(group.items))
            .map((group, index) => (
              <Fragment key={group.label}>
                {index > 0 && isNonEmptyString(group.label) && (
                  <Dropdown.Separator />
                )}
                <Dropdown.Section
                  label={
                    isNonEmptyString(group.label) ? group.label : undefined
                  }
                >
                  {group.items.map((item) => (
                    <NavigationMenuItemSelectableItem
                      key={item.id}
                      item={item}
                    />
                  ))}
                </Dropdown.Section>
              </Fragment>
            ))}
          {!isNonEmptyArray(items) && (
            <Dropdown.Empty>{emptyMessage}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
