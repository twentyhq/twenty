import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useLingui } from '@lingui/react/macro';
import { type ViewerControlsConfiguration } from 'twenty-shared/types';
import { IconArrowsSort, IconFilter } from 'twenty-ui/icon';

const WIDGET_VIEWER_FILTER_SETTING_ITEM_ID = 'record-table-show-filter';
const WIDGET_VIEWER_SORT_SETTING_ITEM_ID = 'record-table-show-sort';

export const getWidgetViewerControlsSettingsItemIds = ({
  isSortAvailable,
}: {
  isSortAvailable: boolean;
}) => [
  WIDGET_VIEWER_FILTER_SETTING_ITEM_ID,
  ...(isSortAvailable ? [WIDGET_VIEWER_SORT_SETTING_ITEM_ID] : []),
];

type WidgetViewerControlsSettingsRowsProps = {
  viewerControls?: ViewerControlsConfiguration;
  isSortAvailable?: boolean;
  onViewerControlsChange: (viewerControls: ViewerControlsConfiguration) => void;
};

export const WidgetViewerControlsSettingsRows = ({
  viewerControls,
  isSortAvailable = true,
  onViewerControlsChange,
}: WidgetViewerControlsSettingsRowsProps) => {
  const { t } = useLingui();

  return (
    <>
      <SelectableListItem itemId={WIDGET_VIEWER_FILTER_SETTING_ITEM_ID}>
        <CommandMenuItemToggle
          LeftIcon={IconFilter}
          text={t`Show filter`}
          id={WIDGET_VIEWER_FILTER_SETTING_ITEM_ID}
          toggled={viewerControls?.filter ?? false}
          onToggleChange={(filter) =>
            onViewerControlsChange({ ...viewerControls, filter })
          }
        />
      </SelectableListItem>
      {isSortAvailable && (
        <SelectableListItem itemId={WIDGET_VIEWER_SORT_SETTING_ITEM_ID}>
          <CommandMenuItemToggle
            LeftIcon={IconArrowsSort}
            text={t`Show sort`}
            id={WIDGET_VIEWER_SORT_SETTING_ITEM_ID}
            toggled={viewerControls?.sort ?? false}
            onToggleChange={(sort) =>
              onViewerControlsChange({ ...viewerControls, sort })
            }
          />
        </SelectableListItem>
      )}
    </>
  );
};
