import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type DropResult } from '@hello-pangea/dnd';

import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { IconGripVertical } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

type ChartManualSortAxis = 'primary' | 'secondary' | 'pie';

type ChartManualSortContentProps = {
  fieldMetadataItem: FieldMetadataItem;
  axis: ChartManualSortAxis;
};

const StyledIconGripVertical = styled(IconGripVertical)`
  margin-right: ${({ theme }) => theme.spacing(0.75)};
`;

const getManualSortConfigKey = (axis: ChartManualSortAxis) => {
  switch (axis) {
    case 'pie':
      return 'manualSortOrder' as const;
    case 'primary':
      return 'primaryAxisManualSortOrder' as const;
    case 'secondary':
      return 'secondaryAxisManualSortOrder' as const;
  }
};

const getManualSortOrder = (
  configuration:
    | { __typename?: string; [key: string]: unknown }
    | null
    | undefined,
  axis: ChartManualSortAxis,
): string[] | undefined => {
  if (!isDefined(configuration)) return undefined;

  const configKey = getManualSortConfigKey(axis);

  if (
    axis === 'pie' &&
    configuration.__typename === 'PieChartConfiguration' &&
    'manualSortOrder' in configuration
  ) {
    return (configuration.manualSortOrder as string[] | null) ?? undefined;
  }

  if (
    (axis === 'primary' || axis === 'secondary') &&
    (configuration.__typename === 'BarChartConfiguration' ||
      configuration.__typename === 'LineChartConfiguration') &&
    configKey in configuration
  ) {
    return (configuration[configKey] as string[] | null) ?? undefined;
  }

  return undefined;
};

export const ChartManualSortContent = ({
  fieldMetadataItem,
  axis,
}: ChartManualSortContentProps) => {
  const theme = useTheme();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const configuration = widgetInEditMode?.configuration;
  const options = fieldMetadataItem.options ?? [];

  const currentManualSortOrder = getManualSortOrder(configuration, axis);

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

  if (options.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
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
    </>
  );
};
