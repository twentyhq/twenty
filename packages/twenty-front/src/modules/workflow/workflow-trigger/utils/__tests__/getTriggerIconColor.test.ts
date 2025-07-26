/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { Theme } from '@emotion/react';
import { getTriggerIconColor } from '../getTriggerIconColor';

describe('getTriggerIconColor', () => {
  const mockTheme: Theme = {
    font: {
      color: {
        primary: '#2c2c2c',
        secondary: '#666666',
        tertiary: '#999999',
        light: '#cccccc',
      },
    },
  } as unknown as Theme;

  it('returns the tertiary font color from theme', () => {
    const result = getTriggerIconColor({ theme: mockTheme });

    expect(result).toBe('#999999');
  });

  it('works with different theme configurations', () => {
    const differentTheme: Theme = {
      font: {
        color: {
          primary: '#000000',
          secondary: '#444444',
          tertiary: '#888888',
          light: '#ffffff',
        },
      },
    } as unknown as Theme;

    const result = getTriggerIconColor({ theme: differentTheme });

    expect(result).toBe('#888888');
  });

  it('maintains reference to theme.font.color.tertiary', () => {
    const customTheme: Theme = {
      font: {
        color: {
          primary: '#111111',
          secondary: '#333333',
          tertiary: '#custom-tertiary-color',
          light: '#eeeeee',
        },
      },
    } as unknown as Theme;

    const result = getTriggerIconColor({ theme: customTheme });

    expect(result).toBe('#custom-tertiary-color');
  });
});
