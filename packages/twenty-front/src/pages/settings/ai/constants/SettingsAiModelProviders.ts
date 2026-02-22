import {
  IconBrandAnthropic,
  IconBrandGoogle,
  IconBrandMistral,
  IconBrandOpenai,
  IconBrandXai,
  IconRobot,
  type IconComponent,
} from 'twenty-ui/display';

// Keyed by the server-side ModelFamily enum values (lowercase) since
// the client config is fetched via REST, not GraphQL.
export const MODEL_FAMILY_CONFIG: Record<
  string,
  { label: string; Icon: IconComponent }
> = {
  openai: { label: 'OpenAI', Icon: IconBrandOpenai },
  anthropic: { label: 'Anthropic', Icon: IconBrandAnthropic },
  xai: { label: 'xAI', Icon: IconBrandXai },
  google: { label: 'Google', Icon: IconBrandGoogle },
  mistral: { label: 'Mistral', Icon: IconBrandMistral },
  FALLBACK: { label: '', Icon: IconRobot },
};
