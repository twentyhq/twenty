import { useGetRecordIndexTabLabel } from '@/object-record/record-index-tab/hooks/useGetRecordIndexTabLabel';
import { usePersistRecordIndexViewTabs } from '@/object-record/record-index-tab/hooks/usePersistRecordIndexViewTabs';
import { useUpdateRecordIndexTabField } from '@/object-record/record-index-tab/hooks/useUpdateRecordIndexTabField';
import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { getRecordIndexTabColorDotIcon } from '@/object-record/record-index-tab/utils/getRecordIndexTabColorDotIcon';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { ListItemButton } from 'twenty-ui/components/navigation';
import {
  IconChevronLeft,
  IconEye,
  IconEyeOff,
  IconListSearch,
  IconTrash,
} from 'twenty-ui/icon';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

type RecordIndexTabMode = 'field' | 'custom' | 'none';

export const ViewPickerTabFieldContent = () => {
  const { t } = useLingui();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { setViewPickerMode } = useViewPickerMode();

  const { canPersistChanges } = useCanPersistViewChanges();

  const { getRecordIndexTabLabel } = useGetRecordIndexTabLabel();

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const recordIndexTabs = useAtomComponentSelectorValue(
    recordIndexTabsComponentSelector,
  );

  const { updateRecordIndexTabField } =
    useUpdateRecordIndexTabField(recordIndexId);

  const { updateRecordIndexTab, reorderRecordIndexTabs, destroyAllViewTabs } =
    usePersistRecordIndexViewTabs();

  const visibleRecordIndexTabs = recordIndexTabs.filter(
    ({ isVisible }) => isVisible,
  );

  const hiddenRecordIndexTabs = recordIndexTabs.filter(
    ({ isVisible }) => !isVisible,
  );

  const recordIndexTabMode: RecordIndexTabMode = isDefined(
    recordIndexTabFieldMetadataItem,
  )
    ? 'field'
    : isNonEmptyArray(recordIndexTabs)
      ? 'custom'
      : 'none';

  const recordIndexTabSourceLabel =
    recordIndexTabMode === 'field'
      ? recordIndexTabFieldMetadataItem?.label
      : recordIndexTabMode === 'custom'
        ? t`Custom filters`
        : t`None`;

  const handleVisibleTabDragEnd = async (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    await reorderRecordIndexTabs([
      ...moveArrayItem(visibleRecordIndexTabs, {
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      }),
      ...hiddenRecordIndexTabs,
    ]);
  };

  const handleRemoveTabs = async () => {
    await updateRecordIndexTabField(undefined);
    await destroyAllViewTabs();
    setViewPickerMode('list');
  };

  const getTabStartIcon = ({ color }: RecordIndexTab) => {
    // An empty icon slot keeps No value and All aligned with the option labels
    if (!isDefined(color)) {
      return <svg aria-hidden />;
    }

    const ColorDotIcon = getRecordIndexTabColorDotIcon(color);

    return <ColorDotIcon />;
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setViewPickerMode('list')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Tabs`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer scrollable={false}>
        <ListItemButton
          onClick={() => setViewPickerMode('tab-field-select')}
          startIcon={<IconListSearch />}
          description={recordIndexTabSourceLabel}
          descriptionPlacement="end"
          disabled={!canPersistChanges}
          hasSubmenu
        >{t`Tabs by`}</ListItemButton>
      </DropdownMenuItemsContainer>
      {isNonEmptyArray(visibleRecordIndexTabs) && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSectionLabel label={t`Visible tabs`} />
          <DropdownMenuItemsContainer>
            <DraggableList
              onDragEnd={handleVisibleTabDragEnd}
              draggableItems={visibleRecordIndexTabs.map(
                (recordIndexTab, index) => {
                  const recordIndexTabLabel =
                    getRecordIndexTabLabel(recordIndexTab);

                  return (
                    <DraggableItem
                      key={recordIndexTab.id}
                      draggableId={recordIndexTab.id}
                      index={index}
                      isDragDisabled={!canPersistChanges}
                      itemComponent={
                        <DraggableListRow
                          startIcon={getTabStartIcon(recordIndexTab)}
                          dragHandleVisibility="always"
                          isDragDisabled={!canPersistChanges}
                          actionsVisibility="always"
                          actions={
                            canPersistChanges &&
                            visibleRecordIndexTabs.length > 1 ? (
                              <LightIconButton
                                aria-label={t`Hide ${recordIndexTabLabel}`}
                                onClick={() =>
                                  updateRecordIndexTab(recordIndexTab, {
                                    isVisible: false,
                                  })
                                }
                              >
                                <IconEye />
                              </LightIconButton>
                            ) : undefined
                          }
                        >
                          {recordIndexTabLabel}
                        </DraggableListRow>
                      }
                    />
                  );
                },
              )}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {isNonEmptyArray(hiddenRecordIndexTabs) && (
        <>
          <DropdownMenuSectionLabel label={t`Hidden`} />
          <DropdownMenuItemsContainer hasMaxHeight>
            {hiddenRecordIndexTabs.map((recordIndexTab) => {
              const recordIndexTabLabel =
                getRecordIndexTabLabel(recordIndexTab);

              return (
                <DraggableListRow
                  key={recordIndexTab.id}
                  startIcon={getTabStartIcon(recordIndexTab)}
                  isMuted
                  actionsVisibility="always"
                  actions={
                    canPersistChanges ? (
                      <LightIconButton
                        aria-label={t`Show ${recordIndexTabLabel}`}
                        onClick={() =>
                          updateRecordIndexTab(recordIndexTab, {
                            isVisible: true,
                          })
                        }
                      >
                        <IconEyeOff />
                      </LightIconButton>
                    ) : undefined
                  }
                >
                  {recordIndexTabLabel}
                </DraggableListRow>
              );
            })}
          </DropdownMenuItemsContainer>
        </>
      )}
      {recordIndexTabMode !== 'none' && canPersistChanges && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <ListItemButton
              onClick={handleRemoveTabs}
              startIcon={<IconTrash />}
            >
              {t`Remove tabs`}
            </ListItemButton>
          </DropdownMenuItemsContainer>
        </>
      )}
    </LegacyDropdownContent>
  );
};
