import { type ThemeType } from 'twenty-ui/theme';

import { type GraphColorRegistry } from '../types/GraphColorRegistry';

export const createGraphColorRegistry = (
  theme: ThemeType,
): GraphColorRegistry => ({
  blue: {
    name: 'blue',
    gradient: {
      normal: [theme.adaptiveColors.blue1, theme.adaptiveColors.blue2],
      hover: [theme.adaptiveColors.blue3, theme.adaptiveColors.blue4],
    },
    solid: theme.color.blue,
  },
  purple: {
    name: 'purple',
    gradient: {
      normal: [theme.adaptiveColors.purple1, theme.adaptiveColors.purple2],
      hover: [theme.adaptiveColors.purple3, theme.adaptiveColors.purple4],
    },
    solid: theme.color.purple,
  },
  turquoise: {
    name: 'turquoise',
    gradient: {
      normal: [
        theme.adaptiveColors.turquoise1,
        theme.adaptiveColors.turquoise2,
      ],
      hover: [theme.adaptiveColors.turquoise3, theme.adaptiveColors.turquoise4],
    },
    solid: theme.color.turquoise,
  },
  orange: {
    name: 'orange',
    gradient: {
      normal: [theme.adaptiveColors.orange1, theme.adaptiveColors.orange2],
      hover: [theme.adaptiveColors.orange3, theme.adaptiveColors.orange4],
    },
    solid: theme.color.orange,
  },
  pink: {
    name: 'pink',
    gradient: {
      normal: [theme.adaptiveColors.pink1, theme.adaptiveColors.pink2],
      hover: [theme.adaptiveColors.pink3, theme.adaptiveColors.pink4],
    },
    solid: theme.color.pink,
  },
});
