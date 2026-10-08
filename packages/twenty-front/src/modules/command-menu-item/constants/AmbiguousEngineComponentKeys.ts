import { EngineComponentKey } from '~/generated-metadata/graphql';

export const AMBIGUOUS_ENGINE_COMPONENT_KEYS = [
  EngineComponentKey.COMPOSE_EMAIL,
  EngineComponentKey.COMPOSE_CAMPAIGN,
  EngineComponentKey.FRONT_COMPONENT_RENDERER,
  EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
] as const;
