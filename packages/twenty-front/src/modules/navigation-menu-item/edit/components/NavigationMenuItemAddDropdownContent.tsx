import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useState, type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconArrowLeft,
  IconBox,
  IconFolder,
  IconLink,
  IconTable,
  IconUser,
  useIcons,
} from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';
import { Avatar, TintedIconTile } from 'twenty-ui/primitives/data-display';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import {
  useNavigationMenuItemEditController,
  type NewNavigationMenuItemInput,
} from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuObjectMetadataForSection } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection';
import { useAvailableNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/side-panel/hooks/useAvailableNavigationMenuItemSearchRecords';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/side-panel/utils/getAvailableObjectMetadataForNewSidebarItem';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/side-panel/utils/isViewDisplayableInNavigationMenu';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAddFolderToNavigationMenu } from '@/navigation-menu-item/edit/side-panel/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/navigation-menu-item/edit/side-panel/hooks/useAddLinkToNavigationMenu';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { ViewKey } from '@/views/types/ViewKey';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type Step = 'main' | 'object' | 'view' | 'record';
type Item = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
  hasSubMenu?: boolean;
};
const NavigationMenuItemAddDropdownOption = ({ item }: { item: Item }) => {
  const { t } = useLingui();
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    item.id,
  );
  return (
    <SelectableListItem
      itemId={item.id}
      onEnter={item.isDisabled ? undefined : item.onClick}
    >
      <MenuItem
        text={item.label}
        LeftComponent={item.icon}
        onClick={item.onClick}
        disabled={item.isDisabled}
        contextualText={
          item.isDisabled && !item.hasSubMenu ? t`Already in navbar` : undefined
        }
        contextualTextPosition="left"
        hasSubMenu={item.hasSubMenu}
        focused={isSelectedItemId}
      />
    </SelectableListItem>
  );
};

type NavigationMenuItemAddDropdownContentProps = {
  dropdownId: string;
  folderId?: string;
  position?: number;
  onClose: () => void;
};

export const NavigationMenuItemAddDropdownContent = ({
  dropdownId,
  folderId,
  position,
  onClose,
}: NavigationMenuItemAddDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { handleAddFolder } = useAddFolderToNavigationMenu();
  const { handleAddLink } = useAddLinkToNavigationMenu();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [step, setStep] = useState<Step>('main');
  const [search, setSearch] = useState('');
  const [objectId, setObjectId] = useState<string | null>(null);
  const { currentItems, createItem } = useNavigationMenuItemEditController();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const {
    views,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsAlreadyAdded,
    viewIdsAlreadyAdded,
  } = useNavigationMenuObjectMetadataForSection(currentItems);
  const { availableSearchRecords, recordSearchLoading, isSearchDebouncing } =
    useAvailableNavigationMenuItemSearchRecords({
      searchInput: search,
      skip: step !== 'record',
    });
  const {
    availableObjectMetadataItems,
    availableSystemObjectMetadataItems,
    objectMetadataItemsWithViews,
    availableSystemObjectMetadataItemsForView,
  } = getAvailableObjectMetadataForNewSidebarItem({
    objectMetadataItems,
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithDisplayableViews: new Set(
      views
        .filter((view) => view.key !== ViewKey.INDEX)
        .map((view) => view.objectMetadataId),
    ),
  });

  const addItem = (input: NewNavigationMenuItemInput) => {
    const itemId = createItem(input, {
      targetFolderId: folderId ?? null,
      targetIndex: position,
    });
    onClose();
    const object = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === input.targetObjectMetadataId,
    );
    const view = views.find(
      (availableView) => availableView.id === input.viewId,
    );
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle:
        input.targetRecordIdentifier?.labelIdentifier ??
        object?.labelSingular ??
        view?.name ??
        t`Edit menu item`,
      pageIcon: getIcon(object?.icon ?? view?.icon),
    });
  };
  const navigate = (next: Step) => {
    setStep(next);
    setSearch('');
    setObjectId(null);
  };
  const goBack = () => {
    setSearch('');
    if (objectId) setObjectId(null);
    else setStep('main');
  };
  const titles: Record<Step, string> = {
    main: t`Add menu item`,
    object: t`Object`,
    view: t`View`,
    record: t`Record`,
  };

  const getItems = (): Item[] => {
    if (step === 'main')
      return [
        {
          id: 'object',
          label: t`Object`,
          icon: <TintedIconTile Icon={IconBox} />,
          onClick: () => navigate('object'),
          hasSubMenu: true,
        },
        {
          id: 'view',
          label: t`View`,
          icon: <TintedIconTile Icon={IconTable} />,
          onClick: () => navigate('view'),
          hasSubMenu: true,
        },
        {
          id: 'record',
          label: t`Record`,
          icon: <TintedIconTile Icon={IconUser} />,
          onClick: () => navigate('record'),
          hasSubMenu: true,
        },
        {
          id: 'folder',
          label: t`Folder`,
          icon: (
            <ColoredIcon
              Icon={IconFolder}
              color={DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
            />
          ),
          onClick: () => {
            onClose();
            handleAddFolder();
          },
          isDisabled: Boolean(folderId),
          hasSubMenu: true,
        },
        {
          id: 'link',
          label: t`Link`,
          icon: (
            <ColoredIcon
              Icon={IconLink}
              color={DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK}
            />
          ),
          onClick: () => {
            onClose();
            handleAddLink();
          },
          hasSubMenu: true,
        },
      ];
    if (step === 'object' || (step === 'view' && !objectId)) {
      const objects =
        step === 'object'
          ? [
              ...availableObjectMetadataItems,
              ...availableSystemObjectMetadataItems,
            ]
          : [
              ...objectMetadataItemsWithViews,
              ...availableSystemObjectMetadataItemsForView,
            ];
      return objects.map((object) => ({
        id: object.id,
        label: object.labelPlural,
        icon: <ObjectMetadataIcon objectMetadataItem={object} />,
        isDisabled:
          step === 'object' && objectMetadataIdsAlreadyAdded.has(object.id),
        hasSubMenu: step === 'view',
        onClick: () => {
          if (step === 'view') {
            setObjectId(object.id);
            setSearch('');
          } else
            addItem({
              type: NavigationMenuItemType.OBJECT,
              targetObjectMetadataId: object.id,
              color: getObjectColorWithFallback(object),
            });
        },
      }));
    }
    if (step === 'view')
      return views
        .filter(
          (view) =>
            view.objectMetadataId === objectId &&
            isViewDisplayableInNavigationMenu(view),
        )
        .sort((a, b) => a.position - b.position)
        .map((view) => {
          const Icon = getIcon(view.icon);
          return {
            id: view.id,
            label: view.name,
            icon: <TintedIconTile Icon={Icon} />,
            isDisabled: viewIdsAlreadyAdded.has(view.id),
            onClick: () =>
              addItem({ type: NavigationMenuItemType.VIEW, viewId: view.id }),
          };
        });
    if (step === 'record')
      return availableSearchRecords.flatMap((record) => {
        const object = objectMetadataItems.find(
          (object) => object.nameSingular === record.objectNameSingular,
        );
        if (!object) return [];
        return [
          {
            id: record.recordId,
            label: record.label,
            icon: (
              <Avatar
                name={record.label}
                src={getAbsoluteImageUrl(record.imageUrl)}
                colorSeed={record.recordId}
              />
            ),
            onClick: () =>
              addItem({
                type: NavigationMenuItemType.RECORD,
                targetObjectMetadataId: object.id,
                targetRecordId: record.recordId,
                targetRecordIdentifier: {
                  id: record.recordId,
                  labelIdentifier: record.label,
                  imageIdentifier: record.imageUrl ?? null,
                },
              }),
          },
        ];
      });
    return [];
  };
  const items = getItems().filter(
    (item) =>
      step === 'record' ||
      item.label
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
  );
  let emptyMessage = t`No results found`;
  if (step === 'record' && !search.trim())
    emptyMessage = t`Type to search records`;
  if (step === 'record' && (recordSearchLoading || isSearchDebouncing))
    emptyMessage = t`Loading...`;

  return (
    <DropdownContent widthInPixels={320}>
      <DropdownMenuHeader
        StartComponent={
          step !== 'main' && (
            <LightIconButton
              Icon={IconArrowLeft}
              aria-label={t`Back`}
              onClick={goBack}
            />
          )
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
          {items.map((item) => (
            <NavigationMenuItemAddDropdownOption key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <DropdownMenuSectionLabel label={emptyMessage} />
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
