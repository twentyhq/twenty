import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { Dropdown } from 'twenty-ui/components/navigation';
import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';

import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { sortOptionsForManualOrder } from '@/page-layout/widgets/graph/utils/sortOptionsForManualOrder';
import { getManualSortOrderFromConfig } from '@/side-panel/pages/page-layout/utils/getManualSortOrderFromConfig';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type WidgetConfiguration } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

type ChartManualSortSubMenuContentProps = {
  fieldMetadataItem: FieldMetadataItem;
  axis: 'primary' | 'secondary';
};

export const ChartManualSortSubMenuContent = ({
  fieldMetadataItem,
  axis,
}: ChartManualSortSubMenuContentProps) => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  // TODO: Remove this cast when FieldsConfiguration and FieldConfiguration are in the backend
  const configuration = widgetInEditMode?.configuration as WidgetConfiguration;
  const options = fieldMetadataItem.options ?? [];

  const currentManualSortOrder = getManualSortOrderFromConfig(
    configuration,
    axis,
  );

  const sortedOptions = sortOptionsForManualOrder(
    options,
    currentManualSortOrder,
  );

  const handleDragEnd = (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    const reorderedOptions = moveArrayItem(sortedOptions, {
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    });

    const newManualSortOrder = reorderedOptions.map((option) => option.value);
    const configKey = isWidgetConfigurationOfType(
      configuration,
      'PieChartConfiguration',
    )
      ? 'manualSortOrder'
      : axis === 'primary'
        ? 'primaryAxisManualSortOrder'
        : 'secondaryAxisManualSortOrder';

    updateCurrentWidgetConfig({
      configToUpdate: { [configKey]: newManualSortOrder },
    });
  };

  return (
    <>
      <Dropdown.Back>{t`Reorder options`}</Dropdown.Back>
      <ChartSettingsDropdownSection>
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
                    <DraggableListRow
                      dragHandleVisibility="always"
                      isDragDisabled={sortedOptions.length === 1}
                    >
                      <Tag truncate={false} color={option.color}>
                        {option.label}
                      </Tag>
                    </DraggableListRow>
                  }
                />
              ))}
            </>
          }
        />
      </ChartSettingsDropdownSection>
    </>
  );
};
