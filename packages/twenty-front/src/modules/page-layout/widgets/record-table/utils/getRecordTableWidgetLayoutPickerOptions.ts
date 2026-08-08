import {
  RECORD_TABLE_WIDGET_LAYOUT_OPTIONS,
  RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES,
  type RecordTableWidgetLayoutViewType,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type IconComponent } from 'twenty-ui/icon';
import { ViewType } from '~/generated-metadata/graphql';

export type RecordTableWidgetLayoutPickerOption = {
  viewType: RecordTableWidgetLayoutViewType;
  Icon: IconComponent;
  label: MessageDescriptor;
  isDisabled: boolean;
  unavailableReason?: MessageDescriptor;
};

type GetRecordTableWidgetLayoutPickerOptionsParams = {
  isKanbanAvailable: boolean;
  isCalendarAvailable: boolean;
  isListViewEnabled: boolean;
};

// Kanban and calendar stay visible but disabled when the object has no field
// to drive them, so the layout exists in the picker with the reason why it
// can't be picked; list is hidden outright until the feature flag is on.
export const getRecordTableWidgetLayoutPickerOptions = ({
  isKanbanAvailable,
  isCalendarAvailable,
  isListViewEnabled,
}: GetRecordTableWidgetLayoutPickerOptionsParams): RecordTableWidgetLayoutPickerOption[] =>
  RECORD_TABLE_WIDGET_LAYOUT_VIEW_TYPES.filter(
    (viewType) => viewType !== ViewType.LIST_WIDGET || isListViewEnabled,
  ).map((viewType) => ({
    viewType,
    ...RECORD_TABLE_WIDGET_LAYOUT_OPTIONS[viewType],
    isDisabled:
      (viewType === ViewType.KANBAN_WIDGET && !isKanbanAvailable) ||
      (viewType === ViewType.CALENDAR_WIDGET && !isCalendarAvailable),
    unavailableReason:
      viewType === ViewType.KANBAN_WIDGET && !isKanbanAvailable
        ? msg`Needs a Select field`
        : viewType === ViewType.CALENDAR_WIDGET && !isCalendarAvailable
          ? msg`Needs a Date field`
          : undefined,
  }));

// A layout that is hidden or disabled must not be applied even if its row is
// reached by keyboard, so selection asks the same options the picker renders.
export const isSelectableLayout = (
  layoutOptions: RecordTableWidgetLayoutPickerOption[],
  viewType: RecordTableWidgetLayoutViewType,
): boolean =>
  layoutOptions.some(
    (layoutOption) =>
      layoutOption.viewType === viewType && !layoutOption.isDisabled,
  );
