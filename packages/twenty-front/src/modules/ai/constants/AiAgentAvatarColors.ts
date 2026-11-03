import { type AgentAvatarColor } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

export const AI_AGENT_AVATAR_COLORS: Record<
  AgentAvatarColor,
  { body: string; face: string }
> = {
  blue: {
    body: themeCssVariables.color.blue4,
    face: themeCssVariables.color.blue10,
  },
  sky: {
    body: themeCssVariables.color.sky4,
    face: themeCssVariables.color.sky11,
  },
  turquoise: {
    body: themeCssVariables.color.turquoise4,
    face: themeCssVariables.color.turquoise10,
  },
  green: {
    body: themeCssVariables.color.green4,
    face: themeCssVariables.color.green10,
  },
  yellow: {
    body: themeCssVariables.color.yellow4,
    face: themeCssVariables.color.yellow11,
  },
  orange: {
    body: themeCssVariables.color.orange4,
    face: themeCssVariables.color.orange10,
  },
  red: {
    body: themeCssVariables.color.red4,
    face: themeCssVariables.color.red10,
  },
  pink: {
    body: themeCssVariables.color.pink4,
    face: themeCssVariables.color.pink10,
  },
  purple: {
    body: themeCssVariables.color.purple4,
    face: themeCssVariables.color.purple10,
  },
  gray: {
    body: themeCssVariables.color.gray4,
    face: themeCssVariables.color.gray10,
  },
};
