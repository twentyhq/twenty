import type * as SharedApplication from 'twenty-shared/application';
import type * as SharedTypes from 'twenty-shared/types';

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
  LooseEnumValues<SharedApplication.CommandMenuItemManifest>;
export type FrontComponentConfig = LooseEnumValues<StrictFrontComponentConfig>;
export type HealthCheckLogicFunctionConfig =
  LooseEnumValues<StrictHealthCheckLogicFunctionConfig>;
export type IndexConfig = LooseEnumValues<StrictIndexConfig>;
export type IndexFieldManifest =
  LooseEnumValues<SharedApplication.IndexFieldManifest>;
export type IndexManifest = LooseEnumValues<SharedApplication.IndexManifest>;
export type LogicFunctionConfig = LooseEnumValues<StrictLogicFunctionConfig>;
export type MessageChannelVisibility =
  LooseEnumValues<SharedTypes.MessageChannelVisibility>;
export type MessageParticipantRole =
  LooseEnumValues<SharedTypes.MessageParticipantRole>;
export type ObjectFieldManifest =
  LooseEnumValues<SharedApplication.ObjectFieldManifest>;
export type PageLayoutConfig = LooseEnumValues<StrictPageLayoutConfig>;
export type PageLayoutManifest =
  LooseEnumValues<SharedApplication.PageLayoutManifest>;
export type PageLayoutTabConfig = LooseEnumValues<StrictPageLayoutTabConfig>;
export type PageLayoutTabManifest =
  LooseEnumValues<SharedApplication.PageLayoutTabManifest>;
export type PageLayoutWidgetCanvasPosition =
  LooseEnumValues<SharedTypes.PageLayoutWidgetCanvasPosition>;
export type PageLayoutWidgetConditionalDisplay =
  LooseEnumValues<SharedTypes.PageLayoutWidgetConditionalDisplay>;
export type PageLayoutWidgetGridPosition =
  LooseEnumValues<SharedTypes.PageLayoutWidgetGridPosition>;
export type PageLayoutWidgetManifest =
  LooseEnumValues<SharedApplication.PageLayoutWidgetManifest>;
export type PageLayoutWidgetPosition =
  LooseEnumValues<SharedTypes.PageLayoutWidgetPosition>;
export type PageLayoutWidgetUniversalConfiguration =
  LooseEnumValues<SharedTypes.PageLayoutWidgetUniversalConfiguration>;
export type PageLayoutWidgetVerticalListPosition =
  LooseEnumValues<SharedTypes.PageLayoutWidgetVerticalListPosition>;
export type PermissionFlagConfig = LooseEnumValues<StrictPermissionFlagConfig>;
export type PermissionFlagManifest =
  LooseEnumValues<SharedApplication.PermissionFlagManifest>;
export type RowLevelPermissionPredicateGroupManifest =
  LooseEnumValues<SharedApplication.RowLevelPermissionPredicateGroupManifest>;
export type RowLevelPermissionPredicateManifest =
  LooseEnumValues<SharedApplication.RowLevelPermissionPredicateManifest>;
export type SendInboxMessageInput =
  LooseEnumValues<SharedApplication.SendInboxMessageInput>;
export type SettingsFrontComponentConfig =
  LooseEnumValues<StrictSettingsFrontComponentConfig>;
export type SettingsMenuItemConfig =
  LooseEnumValues<StrictSettingsMenuItemConfig>;
export type SettingsMenuItemManifest =
  LooseEnumValues<SharedApplication.SettingsMenuItemManifest>;
export type StandalonePageLayoutWidgetManifest =
  LooseEnumValues<SharedApplication.StandalonePageLayoutWidgetManifest>;
export type StandaloneViewFieldManifest =
  LooseEnumValues<SharedApplication.StandaloneViewFieldManifest>;
export type TimelineActivityTypeConfig =
  LooseEnumValues<StrictTimelineActivityTypeConfig>;
export type TimelineActivityTypeManifest =
  LooseEnumValues<SharedApplication.TimelineActivityTypeManifest>;
export type ViewConfig = LooseEnumValues<StrictViewConfig>;
export type ViewFieldGroupManifest =
  LooseEnumValues<SharedApplication.ViewFieldGroupManifest>;
export type ViewFieldManifest =
  LooseEnumValues<SharedApplication.ViewFieldManifest>;
export type ViewFilterGroupManifest =
  LooseEnumValues<SharedApplication.ViewFilterGroupManifest>;
export type ViewFilterManifest =
  LooseEnumValues<SharedApplication.ViewFilterManifest>;
export type ViewGroupManifest =
  LooseEnumValues<SharedApplication.ViewGroupManifest>;
export type ViewSortManifest =
  LooseEnumValues<SharedApplication.ViewSortManifest>;
export type WorkflowManifest =
  LooseEnumValues<SharedApplication.WorkflowManifest>;
