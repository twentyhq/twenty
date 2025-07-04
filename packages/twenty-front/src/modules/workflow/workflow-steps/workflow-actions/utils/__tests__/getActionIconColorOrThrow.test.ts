import { WorkflowActionType } from '@/workflow/types/Workflow';
import { COLOR, GRAY_SCALE } from 'twenty-ui/theme';
import { getActionIconColorOrThrow } from '../getActionIconColorOrThrow';

const mockTheme = {
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
} as any;

describe('getActionIconColorOrThrow', () => {
  describe('action types that return orange color', () => {
    it('should return orange color for CODE action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'CODE',
      });

      expect(result).toBe(mockTheme.color.orange);
    });

    it('should return orange color for HTTP_REQUEST action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'HTTP_REQUEST',
      });

      expect(result).toBe(mockTheme.color.orange);
    });
  });

  describe('action types that return tertiary font color', () => {
    const recordActionTypes: WorkflowActionType[] = [
      'CREATE_RECORD',
      'UPDATE_RECORD',
      'DELETE_RECORD',
      'FIND_RECORDS',
      'FORM',
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

  describe('action types that return blue color', () => {
    it('should return blue color for SEND_EMAIL action type', () => {
      const result = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'SEND_EMAIL',
      });

      expect(result).toBe(mockTheme.color.blue);
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
    it('should throw an error for FILTER action type', () => {
      expect(() => {
        getActionIconColorOrThrow({
          theme: mockTheme,
          actionType: 'FILTER',
        });
      }).toThrow("The Filter action isn't meant to be displayed as a node.");
    });

    it('should throw the correct error message for FILTER action type', () => {
      try {
        getActionIconColorOrThrow({
          theme: mockTheme,
          actionType: 'FILTER',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "The Filter action isn't meant to be displayed as a node.",
        );
      }
    });
  });

  describe('theme object handling', () => {
    it('should use the provided theme colors correctly', () => {
      const customTheme = {
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
      } as any;

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'CODE',
        }),
      ).toBe(COLOR.red);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'SEND_EMAIL',
        }),
      ).toBe(COLOR.purple);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'AI_AGENT',
        }),
      ).toBe(COLOR.turquoise);

      expect(
        getActionIconColorOrThrow({
          theme: customTheme,
          actionType: 'CREATE_RECORD',
        }),
      ).toBe(GRAY_SCALE.gray50);
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
      expect(result1).toBe(mockTheme.color.orange);
    });
  });

  describe('color grouping logic', () => {
    it('should group CODE and HTTP_REQUEST actions with orange color', () => {
      const orangeActions: WorkflowActionType[] = ['CODE', 'HTTP_REQUEST'];

      orangeActions.forEach((actionType) => {
        const result = getActionIconColorOrThrow({
          theme: mockTheme,
          actionType,
        });
        expect(result).toBe(mockTheme.color.orange);
      });
    });

    it('should group record-related actions with tertiary font color', () => {
      const recordActions: WorkflowActionType[] = [
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'FIND_RECORDS',
        'FORM',
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
      const orangeResult = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'CODE',
      });

      const tertiaryResult = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'CREATE_RECORD',
      });

      const blueResult = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'SEND_EMAIL',
      });

      const pinkResult = getActionIconColorOrThrow({
        theme: mockTheme,
        actionType: 'AI_AGENT',
      });

      const colors = [orangeResult, tertiaryResult, blueResult, pinkResult];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle theme object with missing properties gracefully', () => {
      const incompleteTheme = {
        color: {
          orange: COLOR.orange,
        },
        font: {
          color: {
            tertiary: GRAY_SCALE.gray40,
          },
        },
      } as any;

      expect(
        getActionIconColorOrThrow({
          theme: incompleteTheme,
          actionType: 'CODE',
        }),
      ).toBe(COLOR.orange);

      expect(
        getActionIconColorOrThrow({
          theme: incompleteTheme,
          actionType: 'CREATE_RECORD',
        }),
      ).toBe(GRAY_SCALE.gray40);
    });

    it('should handle null or undefined theme gracefully', () => {
      expect(() => {
        getActionIconColorOrThrow({
          theme: null as any,
          actionType: 'CODE',
        });
      }).toThrow();
    });
  });
});
