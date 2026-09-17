import { EngineComponentKey } from '~/generated-metadata/graphql';

// These keys ship under more than one availability type, so the key alone does
// not place them: COMPOSE_EMAIL is both a global composer and a record-scoped
// Send Email, COMPOSE_CAMPAIGN is both a global composer and the campaign
// index's create command, and FRONT_COMPONENT_RENDERER is every app command.
// They fall through to COMMAND_MENU_ITEM_SECTION_BY_AVAILABILITY_TYPE instead.
export const AMBIGUOUS_ENGINE_COMPONENT_KEYS = [
  EngineComponentKey.COMPOSE_EMAIL,
  EngineComponentKey.COMPOSE_CAMPAIGN,
  EngineComponentKey.FRONT_COMPONENT_RENDERER,
] as const;
