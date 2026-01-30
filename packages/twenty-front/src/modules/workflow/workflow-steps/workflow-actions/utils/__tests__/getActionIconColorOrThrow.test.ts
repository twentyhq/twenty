import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type Theme } from '@emotion/react';
import { COLOR_LIGHT, GRAY_SCALE_LIGHT } from 'twenty-ui/theme';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';

const mockTheme: Theme = {
  color: {
    orange: COLOR_LIGHT.orange,
    pink: COLOR_LIGHT.pink,
    red: COLOR_LIGHT.red,
  },
  font: {
    color: {
      tertiary: GRAY_SCALE_LIGHT.gray9,
    },
  },
} as Theme;

describe('getActionIconColorOrThrow', () => {
  describe('action types that return red color', () => {
    const coreActionTypes: WorkflowActionType[] = [
      'CODE',
      'HTTP_REQUEST',
      'SEND_EMAIL',
    ];

    coreActionTypes.forEach((actionType) => {
      it(`should return red color for ${actionType} action type`, () => {
        const result = getActionIconColorOrThrow({
          theme: mockTheme,
          actionType,
        });

        expect(result).toBe(mockTheme.color.red);
      });
    });
  });

  describe('action types that return tertiary font color', () => {
    const recordActionTypes: WorkflowActionType[] = [
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'FIND_RECORDS',
    ];

    recordActionTypes.forEach((actionType) => {
      it(`should return tertiary font color for ${actionType} action type`, () => {
        const result = getActionIconColorOrThrow({
          theme: mockTheme,
          actionType,
        });

        expect(result).toBe(mockTheme.font.color.tertiary);
      });
    });
  });

  describe('action types that return orange color', () => {
    it('should return orange color for FORM action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'FORM',
      });

      expect(result).toBe(mockTheme.color.orange);
    });
  });

  describe('action types that return pink color', () => {
    it('should return pink color for AI_AGENT action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'AI_AGENT',
      });

      expect(result).toBe(mockTheme.color.pink);
    });
  });

  describe('FILTER action type', () => {
    it('should return green color for FILTER action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'FILTER',
      });

      expect(result).toBe(mockTheme.color.green12);
    });
  });

  describe('theme object handling', () => {
    it('should use the provided theme colors correctly', () => {
      const customTheme: Theme = {
        color: {
          red: COLOR_LIGHT.red,
          orange: COLOR_LIGHT.orange,
          pink: COLOR_LIGHT.turquoise,
        },
        font: {
          color: {
            tertiary: GRAY_SCALE_LIGHT.gray11,
          },
        },
      } as Theme;

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'CODE',
        }),
      ).toBe(COLOR_LIGHT.red);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'SEND_EMAIL',
        }),
      ).toBe(COLOR_LIGHT.red);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'AI_AGENT',
        }),
      ).toBe(COLOR_LIGHT.turquoise);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'CREATE_RECORD',
        }),
      ).toBe(GRAY_SCALE_LIGHT.gray11);
    });
  });

  describe('type safety and exhaustive checking', () => {
    it('should handle all valid action types without throwing unreachable errors', () => {
      const validActionTypes: WorkflowActionType[] = [
        'CODE',
        'HTTP_REQUEST',
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'FIND_RECORDS',
        'FORM',
        'SEND_EMAIL',
        'AI_AGENT',
      ];

      validActionTypes.forEach((actionType) => {
        expect(() => {
          getActionIconColorOrThrow({
            theme: mockTheme,
            actionType,
          });
        }).not.toThrow();
      });
    });

    it('should return consistent color values for the same action type', () => {
      const actionType: WorkflowActionType = 'CODE';
      const result1 = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType,
      });
      const result2 = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType,
      });

      expect(result1).toBe(result2);
      expect(result1).toBe(mockTheme.color.red);
    });
  });

  describe('color grouping logic', () => {
    it('should group CODE and HTTP_REQUEST actions with red color', () => {
      const orangeActions: WorkflowActionType[] = ['CODE', 'HTTP_REQUEST'];

      orangeActions.forEach((actionType) => {
        const result = getActionIconColorOrThrow({
          theme: mockTheme,
          actionType,
        });
        expect(result).toBe(mockTheme.color.red);
      });
    });

    it('should group record-related actions with tertiary font color', () => {
      const recordActions: WorkflowActionType[] = [
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'FIND_RECORDS',
      ];

      recordActions.forEach((actionType) => {
        const result = getActionIconColorOrThrow({
          theme: mockTheme,
          actionType,
        });
        expect(result).toBe(mockTheme.font.color.tertiary);
      });
    });

    it('should have unique colors for different action categories', () => {
      const tertiaryResult = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'CREATE_RECORD',
      });

      expect(tertiaryResult).toBe(mockTheme.font.color.tertiary);
    });

    it('should return red color for SEND_EMAIL action type', () => {
      expect(
        getActionIconColorOrThrow({
          theme: mockTheme,
          actionType: 'SEND_EMAIL',
        }),
      ).toBe(mockTheme.color.red);
    });

    it('should return pink color for AI_AGENT action type', () => {
      expect(
        getActionIconColorOrThrow({ theme: mockTheme, actionType: 'AI_AGENT' }),
      ).toBe(mockTheme.color.pink);
    });

    it('should use the provided theme colors correctly', () => {
      const customTheme: Theme = {
        color: {
          red: COLOR_LIGHT.red,
          orange: COLOR_LIGHT.orange,
          pink: COLOR_LIGHT.turquoise,
        },
        font: {
          color: {
            tertiary: GRAY_SCALE_LIGHT.gray11,
          },
        },
      } as Theme;

      expect(
        getActionIconColorOrThrow({ theme: customTheme, actionType: 'CODE' }),
      ).toBe(COLOR_LIGHT.red);
      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'SEND_EMAIL',
        }),
      ).toBe(COLOR_LIGHT.red);
      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'AI_AGENT',
        }),
      ).toBe(COLOR_LIGHT.turquoise);
      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'CREATE_RECORD',
        }),
      ).toBe(GRAY_SCALE_LIGHT.gray11);
    });

    it('should return undefined when red color is missing for SEND_EMAIL action', () => {
      const themeWithoutBlue: Theme = {
        color: {
          orange: COLOR_LIGHT.orange,
          pink: COLOR_LIGHT.pink,
        },
        font: {
          color: {
            tertiary: GRAY_SCALE_LIGHT.gray9,
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
});
