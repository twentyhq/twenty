import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { usePersistRecordIndexViewTabs } from '@/object-record/record-index-tab/hooks/usePersistRecordIndexViewTabs';
import { visibleRecordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/visibleRecordIndexTabsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';
import { type ViewTab } from '@/views/types/ViewTab';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconArrowLeft,
  IconArrowRight,
  IconDotsVertical,
  IconEyeOff,
  IconFilter,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

const RENAME_DROPDOWN_PAGE_ID = 'rename';

type RecordIndexCustomTabMenuProps = {
  viewTab: ViewTab;
};

export const RecordIndexCustomTabMenu = ({
  viewTab,
}: RecordIndexCustomTabMenuProps) => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const dropdownId = `record-index-custom-tab-menu-${recordIndexId}`;

  const { closeDropdown } = useCloseDropdown();

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const visibleRecordIndexTabs = useAtomComponentSelectorValue(
    visibleRecordIndexTabsComponentSelector,
  );

  const {
    reorderRecordIndexTabs,
    updateRecordIndexTab,
    renameViewTab,
    destroyViewTabs,
  } = usePersistRecordIndexViewTabs();

  const tabRecordFilters = mapViewFiltersToFilters(
    viewTab.viewFilters ?? [],
    flattenedFieldMetadataItems,
  );

  const tabIndex = visibleRecordIndexTabs.findIndex(
    ({ viewTabId }) => viewTabId === viewTab.id,
  );

  const recordIndexTab = visibleRecordIndexTabs[tabIndex];

  const tabName = viewTab.name ?? '';

  const handleMove = async (offset: -1 | 1) => {
    closeDropdown(dropdownId);
    await reorderRecordIndexTabs(
      moveArrayItem(visibleRecordIndexTabs, {
        fromIndex: tabIndex,
        toIndex: tabIndex + offset,
      }),
    );
  };

  const handleHide = async () => {
    closeDropdown(dropdownId);
    await updateRecordIndexTab(recordIndexTab, { isVisible: false });
  };

  const handleDelete = async () => {
    closeDropdown(dropdownId);
    await destroyViewTabs([viewTab]);
  };

  const handleRenameSubmit = async (name: string) => {
    const trimmedName = name.trim();

    closeDropdown(dropdownId);

    if (!isNonEmptyString(trimmedName) || trimmedName === tabName) {
      return;
    }

    await renameViewTab(viewTab.id, trimmedName);
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`${tabName} tab options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent align="end">
        <Dropdown.Page id="root">
          {isNonEmptyArray(tabRecordFilters) && (
            <>
              <Dropdown.Section label={t`Conditions`}>
                {tabRecordFilters.map((recordFilter) => (
                  <ListItem
                    key={recordFilter.id}
                    startIcon={<IconFilter />}
                    description={getRecordFilterChipLabelValue({
                      recordFilter,
                    })}
                    descriptionPlacement="end"
                  >
                    {recordFilter.label}
                  </ListItem>
                ))}
              </Dropdown.Section>
              <Dropdown.Separator />
            </>
          )}
          <Dropdown.Section>
            <Dropdown.ActionItem
              page={RENAME_DROPDOWN_PAGE_ID}
              startIcon={<IconPencil />}
            >{t`Rename`}</Dropdown.ActionItem>
            {tabIndex > 0 && (
              <Dropdown.ActionItem
                onClick={() => handleMove(-1)}
                startIcon={<IconArrowLeft />}
              >{t`Move left`}</Dropdown.ActionItem>
            )}
            {tabIndex < visibleRecordIndexTabs.length - 1 && (
              <Dropdown.ActionItem
                onClick={() => handleMove(1)}
                startIcon={<IconArrowRight />}
              >{t`Move right`}</Dropdown.ActionItem>
            )}
            {visibleRecordIndexTabs.length > 1 && (
              <Dropdown.ActionItem
                onClick={handleHide}
                startIcon={<IconEyeOff />}
              >{t`Hide tab`}</Dropdown.ActionItem>
            )}
          </Dropdown.Section>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              color="danger"
              onClick={handleDelete}
              startIcon={<IconTrash />}
            >{t`Delete tab`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Page>
        <Dropdown.Page id={RENAME_DROPDOWN_PAGE_ID} type="panel">
          {/* A back button would take the focus that the name input needs */}
          <Dropdown.Header>
            <Dropdown.Title>{t`Rename`}</Dropdown.Title>
          </Dropdown.Header>
          <Dropdown.Section>
            <TextInputDropdownForm
              defaultValue={tabName}
              label={t`Tab name`}
              onSubmit={handleRenameSubmit}
            />
          </Dropdown.Section>
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
