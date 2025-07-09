import { Theme } from '@emotion/react';
import { COLOR, GRAY_SCALE } from 'twenty-ui/theme';
import { getActionIconColorOrThrow } from '../getActionIconColorOrThrow';

const mockTheme: Theme = {
  color: {
    orange: COLOR.orange,
    blue: COLOR.blue,
    pink: COLOR.pink,
  },
  font: {
    color: {
      tertiary: GRAY_SCALE.gray40,
    },
  },
} as Theme;

describe('getActionIconColorOrThrow', () => {
  it('should return orange color for CODE action type', () => {
    expect(
      getActionIconColorOrThrow({ theme: mockTheme, actionType: 'CODE' }),
    ).toBe(mockTheme.color.orange);
  });

  it('should return tertiary font color for CREATE_RECORD action type', () => {
    expect(
      getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'CREATE_RECORD',
      }),
    ).toBe(mockTheme.font.color.tertiary);
  });

  it('should return blue color for SEND_EMAIL action type', () => {
    expect(
      getActionIconColorOrThrow({ theme: mockTheme, actionType: 'SEND_EMAIL' }),
    ).toBe(mockTheme.color.blue);
  });

  it('should return pink color for AI_AGENT action type', () => {
    expect(
      getActionIconColorOrThrow({ theme: mockTheme, actionType: 'AI_AGENT' }),
    ).toBe(mockTheme.color.pink);
  });

  it('should throw an error for FILTER action type', () => {
    expect(() => {
      getActionIconColorOrThrow({ theme: mockTheme, actionType: 'FILTER' });
    }).toThrow("The Filter action isn't meant to be displayed as a node.");
  });

  it('should use the provided theme colors correctly', () => {
    const customTheme: Theme = {
      color: {
        orange: COLOR.red,
        blue: COLOR.purple,
        pink: COLOR.turquoise,
      },
      font: {
        color: {
          tertiary: GRAY_SCALE.gray50,
        },
      },
    } as Theme;

    expect(
      getActionIconColorOrThrow({ theme: customTheme, actionType: 'CODE' }),
    ).toBe(COLOR.red);
    expect(
      getActionIconColorOrThrow({
        theme: customTheme,
        actionType: 'SEND_EMAIL',
      }),
    ).toBe(COLOR.purple);
    expect(
      getActionIconColorOrThrow({ theme: customTheme, actionType: 'AI_AGENT' }),
    ).toBe(COLOR.turquoise);
    expect(
      getActionIconColorOrThrow({
        theme: customTheme,
        actionType: 'CREATE_RECORD',
      }),
    ).toBe(GRAY_SCALE.gray50);
  });

  it('should return undefined when blue color is missing for SEND_EMAIL action', () => {
    const themeWithoutBlue: Theme = {
      color: {
        orange: COLOR.orange,
        pink: COLOR.pink,
      },
      font: {
        color: {
          tertiary: GRAY_SCALE.gray40,
        },
      },
    } as Theme;

    expect(
      getActionIconColorOrThrow({
        theme: themeWithoutBlue,
        actionType: 'SEND_EMAIL',
      }),
    ).toBeUndefined();
  });

  it('should handle null theme gracefully', () => {
    expect(() => {
      getActionIconColorOrThrow({
        theme: null as unknown as Theme,
        actionType: 'CODE',
      });
    }).toThrow();
  });

  it('should return the same color for the same action type', () => {
    const result1 = getActionIconColorOrThrow({
      theme: mockTheme,
      actionType: 'CODE',
    });
    const result2 = getActionIconColorOrThrow({
      theme: mockTheme,
      actionType: 'CODE',
    });
    expect(result1).toBe(result2);
  });
});
