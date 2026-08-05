import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';
import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';

export { ViewType } from '~/generated-metadata/graphql';
import { ViewType } from '~/generated-metadata/graphql';

type ViewTypeLabelKey = `${ViewType}`;

export const VIEW_TYPE_LABELS = {
  [ViewType.TABLE]: msg`Table`,
  [ViewType.KANBAN]: msg`Kanban`,
  [ViewType.CALENDAR]: msg`Calendar`,
  [ViewType.FIELDS_WIDGET]: msg`Fields widget`,
  [ViewType.TABLE_WIDGET]: msg`Table widget`,
  [ViewType.KANBAN_WIDGET]: msg`Kanban widget`,
  [ViewType.CALENDAR_WIDGET]: msg`Calendar widget`,
} satisfies Record<ViewTypeLabelKey, MessageDescriptor>;

export const getViewTypeLabel = (
  viewType: ViewTypeLabelKey = ViewType.TABLE,
): MessageDescriptor =>
  VIEW_TYPE_LABELS[viewType] ?? VIEW_TYPE_LABELS[ViewType.TABLE];

type ViewTypeIconKey =
  (typeof VIEW_TYPE_DEFAULT_ICONS)[keyof typeof VIEW_TYPE_DEFAULT_ICONS];

const VIEW_TYPE_ICON_COMPONENTS = {
  IconCalendar,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} satisfies Record<ViewTypeIconKey, IconComponent>;

export const viewTypeIconMapping = (viewType: ViewType = ViewType.TABLE) =>
  VIEW_TYPE_ICON_COMPONENTS[VIEW_TYPE_DEFAULT_ICONS[viewType]];

export const viewTypeIconKeyMapping = (viewType: ViewType = ViewType.TABLE) =>
  VIEW_TYPE_DEFAULT_ICONS[viewType];
