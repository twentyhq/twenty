import {
  type CommandMenuItemManifest as StrictCommandMenuItemManifest,
  type IndexFieldManifest as StrictIndexFieldManifest,
  type IndexManifest as StrictIndexManifest,
  type ObjectFieldManifest as StrictObjectFieldManifest,
  type PageLayoutManifest as StrictPageLayoutManifest,
  type PageLayoutTabManifest as StrictPageLayoutTabManifest,
  type PageLayoutWidgetManifest as StrictPageLayoutWidgetManifest,
  type PermissionFlagManifest as StrictPermissionFlagManifest,
  type RowLevelPermissionPredicateGroupManifest as StrictRowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest as StrictRowLevelPermissionPredicateManifest,
  type SendInboxMessageInput as StrictSendInboxMessageInput,
  type SettingsMenuItemManifest as StrictSettingsMenuItemManifest,
  type StandalonePageLayoutWidgetManifest as StrictStandalonePageLayoutWidgetManifest,
  type StandaloneViewFieldManifest as StrictStandaloneViewFieldManifest,
  type TimelineActivityTypeManifest as StrictTimelineActivityTypeManifest,
  type ViewFieldGroupManifest as StrictViewFieldGroupManifest,
  type ViewFieldManifest as StrictViewFieldManifest,
  type ViewFilterGroupManifest as StrictViewFilterGroupManifest,
  type ViewFilterManifest as StrictViewFilterManifest,
  type ViewGroupManifest as StrictViewGroupManifest,
  type ViewSortManifest as StrictViewSortManifest,
} from 'twenty-shared/application';
import {
  type MessageChannelVisibility as StrictMessageChannelVisibility,
  type MessageParticipantRole as StrictMessageParticipantRole,
  type PageLayoutWidgetCanvasPosition as StrictPageLayoutWidgetCanvasPosition,
  type PageLayoutWidgetConditionalDisplay as StrictPageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetGridPosition as StrictPageLayoutWidgetGridPosition,
  type PageLayoutWidgetPosition as StrictPageLayoutWidgetPosition,
  type PageLayoutWidgetUniversalConfiguration as StrictPageLayoutWidgetUniversalConfiguration,
  type PageLayoutWidgetVerticalListPosition as StrictPageLayoutWidgetVerticalListPosition,
} from 'twenty-shared/types';

import { type ApplicationConfig as StrictApplicationConfig } from '@/sdk/define/application/application-config';
import { type CommandMenuItemConfig as StrictCommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type LooseEnumValues } from '@/sdk/define/common/types/loose-enum-values.type';
import { type FrontComponentConfig as StrictFrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type SettingsFrontComponentConfig as StrictSettingsFrontComponentConfig } from '@/sdk/define/front-component/settings-front-component-config';
import { type IndexConfig as StrictIndexConfig } from '@/sdk/define/indexes/index-config';
import { type HealthCheckLogicFunctionConfig as StrictHealthCheckLogicFunctionConfig } from '@/sdk/define/logic-functions/health-check-logic-function-config';
import { type LogicFunctionConfig as StrictLogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { type PageLayoutConfig as StrictPageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { type PageLayoutTabConfig as StrictPageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { type PermissionFlagConfig as StrictPermissionFlagConfig } from '@/sdk/define/permission-flags/permission-flag-config';
import { type SettingsMenuItemConfig as StrictSettingsMenuItemConfig } from '@/sdk/define/settings-menu-items/settings-menu-item-config';
import { type TimelineActivityTypeConfig as StrictTimelineActivityTypeConfig } from '@/sdk/define/timeline-activity-types/timeline-activity-type-config';
import { type ViewConfig as StrictViewConfig } from '@/sdk/define/views/view-config';

// What apps write; code building the manifest and the server keep the strict types
export type ApplicationConfig = LooseEnumValues<StrictApplicationConfig>;
export type CommandMenuItemConfig =
  LooseEnumValues<StrictCommandMenuItemConfig>;
export type CommandMenuItemManifest =
  LooseEnumValues<StrictCommandMenuItemManifest>;
export type FrontComponentConfig = LooseEnumValues<StrictFrontComponentConfig>;
export type HealthCheckLogicFunctionConfig =
  LooseEnumValues<StrictHealthCheckLogicFunctionConfig>;
export type IndexConfig = LooseEnumValues<StrictIndexConfig>;
export type IndexFieldManifest = LooseEnumValues<StrictIndexFieldManifest>;
export type IndexManifest = LooseEnumValues<StrictIndexManifest>;
export type LogicFunctionConfig = LooseEnumValues<StrictLogicFunctionConfig>;
export type MessageChannelVisibility =
  LooseEnumValues<StrictMessageChannelVisibility>;
export type MessageParticipantRole =
  LooseEnumValues<StrictMessageParticipantRole>;
export type ObjectFieldManifest = LooseEnumValues<StrictObjectFieldManifest>;
export type PageLayoutConfig = LooseEnumValues<StrictPageLayoutConfig>;
export type PageLayoutManifest = LooseEnumValues<StrictPageLayoutManifest>;
export type PageLayoutTabConfig = LooseEnumValues<StrictPageLayoutTabConfig>;
export type PageLayoutTabManifest =
  LooseEnumValues<StrictPageLayoutTabManifest>;
export type PageLayoutWidgetCanvasPosition =
  LooseEnumValues<StrictPageLayoutWidgetCanvasPosition>;
export type PageLayoutWidgetConditionalDisplay =
  LooseEnumValues<StrictPageLayoutWidgetConditionalDisplay>;
export type PageLayoutWidgetGridPosition =
  LooseEnumValues<StrictPageLayoutWidgetGridPosition>;
export type PageLayoutWidgetManifest =
  LooseEnumValues<StrictPageLayoutWidgetManifest>;
export type PageLayoutWidgetPosition =
  LooseEnumValues<StrictPageLayoutWidgetPosition>;
export type PageLayoutWidgetUniversalConfiguration =
  LooseEnumValues<StrictPageLayoutWidgetUniversalConfiguration>;
export type PageLayoutWidgetVerticalListPosition =
  LooseEnumValues<StrictPageLayoutWidgetVerticalListPosition>;
export type PermissionFlagConfig = LooseEnumValues<StrictPermissionFlagConfig>;
export type PermissionFlagManifest =
  LooseEnumValues<StrictPermissionFlagManifest>;
export type RowLevelPermissionPredicateGroupManifest =
  LooseEnumValues<StrictRowLevelPermissionPredicateGroupManifest>;
export type RowLevelPermissionPredicateManifest =
  LooseEnumValues<StrictRowLevelPermissionPredicateManifest>;
export type SendInboxMessageInput =
  LooseEnumValues<StrictSendInboxMessageInput>;
export type SettingsFrontComponentConfig =
  LooseEnumValues<StrictSettingsFrontComponentConfig>;
export type SettingsMenuItemConfig =
  LooseEnumValues<StrictSettingsMenuItemConfig>;
export type SettingsMenuItemManifest =
  LooseEnumValues<StrictSettingsMenuItemManifest>;
export type StandalonePageLayoutWidgetManifest =
  LooseEnumValues<StrictStandalonePageLayoutWidgetManifest>;
export type StandaloneViewFieldManifest =
  LooseEnumValues<StrictStandaloneViewFieldManifest>;
export type TimelineActivityTypeConfig =
  LooseEnumValues<StrictTimelineActivityTypeConfig>;
export type TimelineActivityTypeManifest =
  LooseEnumValues<StrictTimelineActivityTypeManifest>;
export type ViewConfig = LooseEnumValues<StrictViewConfig>;
export type ViewFieldGroupManifest =
  LooseEnumValues<StrictViewFieldGroupManifest>;
export type ViewFieldManifest = LooseEnumValues<StrictViewFieldManifest>;
export type ViewFilterGroupManifest =
  LooseEnumValues<StrictViewFilterGroupManifest>;
export type ViewFilterManifest = LooseEnumValues<StrictViewFilterManifest>;
export type ViewGroupManifest = LooseEnumValues<StrictViewGroupManifest>;
export type ViewSortManifest = LooseEnumValues<StrictViewSortManifest>;
