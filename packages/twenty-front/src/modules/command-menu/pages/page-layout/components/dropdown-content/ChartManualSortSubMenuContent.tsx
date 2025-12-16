import { useTheme } from '@emotion/react';
import { type DropResult } from '@hello-pangea/dnd';

import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import {
  type ChartManualSortAxis,
  getManualSortConfigKey,
} from '@/command-menu/pages/page-layout/utils/getManualSortConfigKey';
import { getManualSortOrderFromConfig } from '@/command-menu/pages/page-layout/utils/getManualSortOrderFromConfig';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/components';
import { IconChevronLeft, IconGripVertical } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

type ChartManualSortSubMenuContentProps = {
  fieldMetadataItem: FieldMetadataItem;
  axis: ChartManualSortAxis;
  onBack: () => void;
};

export const ChartManualSortSubMenuContent = ({
  fieldMetadataItem,
  axis,
  onBack,
}: ChartManualSortSubMenuContentProps) => {
  const theme = useTheme();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;
  const options = fieldMetadataItem.options ?? [];

  const currentManualSortOrder = getManualSortOrderFromConfig(
    configuration,
    axis,
  );

  const sortedOptions = sortOptionsForManualOrder(
    options,
    currentManualSortOrder,
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedOptions = moveArrayItem(sortedOptions, {
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    });

    const newManualSortOrder = reorderedOptions.map((option) => option.value);
    const configKey = getManualSortConfigKey(axis);

    updateCurrentWidgetConfig({
      configToUpdate: { [configKey]: newManualSortOrder },
    });
  };

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Reorder options`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={
            <>
              {sortedOptions.map((option, index) => (
                <DraggableItem
                  key={option.value}
                  draggableId={option.value}
                  index={index}
                  isDragDisabled={sortedOptions.length === 1}
                  itemComponent={
                    <MenuItem
                      text=""
                      LeftComponent={
                        <>
                          <IconGripVertical
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                            color={theme.font.color.extraLight}
                          />
                          <Tag
                            preventShrink
                            color={option.color}
                            text={option.label}
                          />
                        </>
                      }
                    />
                  }
                />
              ))}
            </>
          }
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
