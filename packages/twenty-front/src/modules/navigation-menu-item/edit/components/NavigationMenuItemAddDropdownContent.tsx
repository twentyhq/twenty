import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemInsertionPreviewEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemInsertionPreviewEffect';
import { useNavigationMenuItemAddOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAddOptions';
import { type NavigationMenuItemAddStep } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddStep';
import { getNavigationMenuItemTabId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemTabId';
import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';
import { useWorkspaceSidebarRootContainerId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootContainerId';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { NavigationMenuAddSectionHiddenItems } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionHiddenItems';
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

const VIEW_OBJECT_PAGE = 'view-object';

type Step = NavigationMenuItemAddStep;

const STEP_BY_PAGE: Partial<Record<string, Step>> = {
  object: 'object',
  view: 'view',
  [VIEW_OBJECT_PAGE]: 'view',
  record: 'record',
  page: 'page',
  nativePage: 'nativePage',
  automation: 'automation',
};

type NavigationMenuItemAddDropdownContentProps = {
  dropdownId: string;
  section: NavigationMenuItemSection;
  // TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
  shouldShowHiddenItems?: boolean;
  parentId?: string;
  position?: number;
  onClose: () => void;
};

export const NavigationMenuItemAddDropdownContent = ({
  dropdownId,
  section,
  shouldShowHiddenItems = false,
  parentId,
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
  const workspaceSidebarRootContainerId = useWorkspaceSidebarRootContainerId();
  const insertionIndex =
    position ??
    currentItems.filter(
      (item) => (item.parentId ?? null) === (parentId ?? null),
    ).length;

  const targetTabId = getNavigationMenuItemTabId({
    parentId,
    items: currentItems,
  });
  const currentTabItems = currentItems.filter(
    (item) =>
      getNavigationMenuItemTabId({
        parentId: item.parentId,
        items: currentItems,
      }) === targetTabId,
  );
  const targetContainerId =
    getNavigationMenuItemContainerId({
      item: { parentId },
      items: currentItems,
    }) ?? workspaceSidebarRootContainerId;
  const isInTargetContainer = (item: (typeof currentItems)[number]) =>
    (getNavigationMenuItemContainerId({ item, items: currentItems }) ??
      workspaceSidebarRootContainerId) === targetContainerId;

  const navigate = (next: Step) => {
    goToPage(next);
    setSearch('');
    setObjectId(null);
  };
  const addItem = (input: NewNavigationMenuItemInput) => {
    const itemId = createItem(input, {
      targetFolderId: parentId ?? null,
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
    automationItemGroups,
    automationLoading,
    standalonePagesLoading,
    standalonePagesError,
    recordSearchLoading,
    isSearchDebouncing,
  } = useNavigationMenuItemAddOptions({
    step,
    search,
    objectId,
    parentId,
    currentItems: currentTabItems.filter(isInTargetContainer),
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
    main: t`Add item`,
    object: t`Object`,
    view: t`View`,
    record: t`Record`,
    page: t`Page`,
    nativePage: t`Native page`,
    automation: t`Automations`,
  };

  const normalizedSearch = normalizeSearchText(search.trim());
  const matchesSearch = (item: NavigationMenuItemOption) =>
    (item.searchableValues ?? [item.label]).some((value) =>
      normalizeSearchText(value).includes(normalizedSearch),
    );
  const getGroups = () => {
    if (isSearchingAllItems) {
      return [
        { label: t`Objects`, items: getItems('object').filter(matchesSearch) },
        { label: t`Views`, items: getItems('view').filter(matchesSearch) },
        { label: t`Pages`, items: getItems('page').filter(matchesSearch) },
        {
          label: t`Native pages`,
          items: getItems('nativePage').filter(matchesSearch),
        },
        {
          label: t`Automations`,
          items: getItems('automation').filter(matchesSearch),
        },
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
      ];
    }

    if (step === 'automation') {
      return automationItemGroups.map((group) => ({
        label: group.label,
        items: group.items.filter(matchesSearch),
      }));
    }

    return [
      {
        label: '',
        items: getItems().filter(
          (item) => step === 'record' || matchesSearch(item),
        ),
      },
    ];
  };

  const groups = getGroups();
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

    if ((step === 'automation' || isSearchingAllItems) && automationLoading) {
      return t`Loading...`;
    }

    return t`No results found`;
  };

  const emptyMessage = getEmptyMessage();
  const isItemTypeList =
    step === 'main' && !isSearchingAllItems && !shouldShowHiddenItems;

  return (
    <>
      <NavigationMenuItemInsertionPreviewEffect
        dropdownId={dropdownId}
        section={section}
        parentId={parentId ?? null}
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
        <Dropdown.Section scrollable={!isItemTypeList}>
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
          {shouldShowHiddenItems && step === 'main' && !isSearchingAllItems && (
            <NavigationMenuAddSectionHiddenItems
              containerId={targetTabId}
              dropdownId={dropdownId}
            />
          )}
          {!isNonEmptyArray(items) && (
            <Dropdown.Empty>{emptyMessage}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
