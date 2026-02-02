import { AgentTurnResolver } from 'src/engine/metadata-modules/ai/ai-agent-monitor/resolvers/agent-turn.resolver';
import { AgentResolver } from 'src/engine/metadata-modules/ai/ai-agent/agent.resolver';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';
import { CommandMenuItemResolver } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.resolver';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FrontComponentResolver } from 'src/engine/metadata-modules/front-component/front-component.resolver';
import { IndexMetadataResolver } from 'src/engine/metadata-modules/index-metadata/index-metadata.resolver';
import { LogicFunctionLayerResolver } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.resolver';
import { LogicFunctionResolver } from 'src/engine/metadata-modules/logic-function/logic-function.resolver';
import { NavigationMenuItemResolver } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.resolver';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { PageLayoutTabResolver } from 'src/engine/metadata-modules/page-layout-tab/resolvers/page-layout-tab.resolver';
import { PageLayoutWidgetResolver } from 'src/engine/metadata-modules/page-layout-widget/resolvers/page-layout-widget.resolver';
import { PageLayoutResolver } from 'src/engine/metadata-modules/page-layout/resolvers/page-layout.resolver';
import { RoleResolver } from 'src/engine/metadata-modules/role/role.resolver';
import { SkillResolver } from 'src/engine/metadata-modules/skill/skill.resolver';
import { ViewFieldResolver } from 'src/engine/metadata-modules/view-field/resolvers/view-field.resolver';
import { ViewFilterGroupResolver } from 'src/engine/metadata-modules/view-filter-group/resolvers/view-filter-group.resolver';
import { ViewFilterResolver } from 'src/engine/metadata-modules/view-filter/resolvers/view-filter.resolver';
import { ViewGroupResolver } from 'src/engine/metadata-modules/view-group/resolvers/view-group.resolver';
import { ViewSortResolver } from 'src/engine/metadata-modules/view-sort/resolvers/view-sort.resolver';
import { ViewResolver } from 'src/engine/metadata-modules/view/resolvers/view.resolver';
import { WebhookResolver } from 'src/engine/metadata-modules/webhook/webhook.resolver';

// Centralized list of all metadata resolvers.
// When adding a new metadata resolver, add it to this list to ensure
// it is included in the /metadata GraphQL schema.
export const metadataResolvers = [
  AgentTurnResolver,
  AgentResolver,
  AgentChatResolver,
  CommandMenuItemResolver,
  FieldMetadataResolver,
  FrontComponentResolver,
  IndexMetadataResolver,
  LogicFunctionLayerResolver,
  LogicFunctionResolver,
  NavigationMenuItemResolver,
  ObjectMetadataResolver,
  PageLayoutTabResolver,
  PageLayoutWidgetResolver,
  PageLayoutResolver,
  RoleResolver,
  SkillResolver,
  ViewFieldResolver,
  ViewFilterGroupResolver,
  ViewFilterResolver,
  ViewGroupResolver,
  ViewSortResolver,
  ViewResolver,
  WebhookResolver,
] as const;
