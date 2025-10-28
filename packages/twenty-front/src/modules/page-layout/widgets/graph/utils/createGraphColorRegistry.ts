import { type ThemeType } from 'twenty-ui/theme';

import { type GraphColorRegistry } from '../types/GraphColorRegistry';

export const createGraphColorRegistry = (
  theme: ThemeType,
): GraphColorRegistry => ({
  blue: {
    name: 'blue',
    gradient: {
      normal: [theme.color.blue3, theme.color.blue5],
      hover: [theme.color.blue7, theme.color.blue8],
    },
    solid: theme.color.blue8,
  },
  purple: {
    name: 'purple',
    gradient: {
      normal: [theme.color.purple3, theme.color.purple5],
      hover: [theme.color.purple7, theme.color.purple8],
    },
    solid: theme.color.purple8,
  },
  turquoise: {
    name: 'turquoise',
    gradient: {
      normal: [theme.color.turquoise3, theme.color.turquoise5],
      hover: [theme.color.turquoise7, theme.color.turquoise8],
    },
    solid: theme.color.turquoise8,
  },
  orange: {
    name: 'orange',
    gradient: {
      normal: [theme.color.orange3, theme.color.orange5],
      hover: [theme.color.orange7, theme.color.orange8],
    },
    solid: theme.color.orange8,
  },
  pink: {
    name: 'pink',
    gradient: {
      normal: [theme.color.pink3, theme.color.pink5],
      hover: [theme.color.pink7, theme.color.pink8],
    },
    solid: theme.color.pink8,
  },
  yellow: {
    name: 'yellow',
    gradient: {
      normal: [theme.color.yellow3, theme.color.yellow5],
      hover: [theme.color.yellow7, theme.color.yellow8],
    },
    solid: theme.color.yellow8,
  },
  red: {
    name: 'red',
    gradient: {
      normal: [theme.color.red3, theme.color.red5],
      hover: [theme.color.red7, theme.color.red8],
    },
    solid: theme.color.red8,
  },
  green: {
    name: 'green',
    gradient: {
      normal: [theme.color.green3, theme.color.green5],
      hover: [theme.color.green7, theme.color.green8],
    },
    solid: theme.color.green8,
  },
  sky: {
    name: 'sky',
    gradient: {
      normal: [theme.color.sky3, theme.color.sky5],
      hover: [theme.color.sky7, theme.color.sky8],
    },
    solid: theme.color.sky8,
  },
  gray: {
    name: 'gray',
    gradient: {
      normal: [theme.color.gray3, theme.color.gray5],
      hover: [theme.color.gray7, theme.color.gray8],
    },
    solid: theme.color.gray8,
  },
});
