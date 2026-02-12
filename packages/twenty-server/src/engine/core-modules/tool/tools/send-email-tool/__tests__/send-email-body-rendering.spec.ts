import { isValidElement, type ReactElement } from 'react';
import { reactMarkupFromJSON } from 'twenty-emails';

describe('Send Email Body Rendering', () => {
  describe('hardBreak node rendering', () => {
    it('should return valid React element for content with hardBreak', () => {
      const jsonWithHardBreak = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'hardBreak' },
              { type: 'text', text: 'World' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(jsonWithHardBreak);

      expect(isValidElement(reactMarkup)).toBe(true);
    });

    it('should return valid React element for multiple hardBreak nodes', () => {
      const jsonWithMultipleBreaks = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Line 1' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Line 2' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Line 3' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(jsonWithMultipleBreaks);

      expect(isValidElement(reactMarkup)).toBe(true);
    });

    it('should return valid React element for hardBreak at paragraph start', () => {
      const jsonWithLeadingBreak = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'hardBreak' },
              { type: 'text', text: 'After break' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(jsonWithLeadingBreak);

      expect(isValidElement(reactMarkup)).toBe(true);
    });

    it('should return valid React element for hardBreak at paragraph end', () => {
      const jsonWithTrailingBreak = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Before break' },
              { type: 'hardBreak' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(jsonWithTrailingBreak);

      expect(isValidElement(reactMarkup)).toBe(true);
    });

    it('should return valid React element for paragraph with only hardBreak', () => {
      const jsonWithOnlyBreak = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'hardBreak' }],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(jsonWithOnlyBreak);

      expect(isValidElement(reactMarkup)).toBe(true);
    });

    it('should include br element in the rendered output', () => {
      const jsonWithHardBreak = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'hardBreak' },
              { type: 'text', text: 'World' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(
        jsonWithHardBreak,
      ) as ReactElement;

      const findBrElements = (element: ReactElement): boolean => {
        if (!element || typeof element !== 'object') return false;
        if (element.type === 'br') return true;

        const children = element.props?.children;

        if (!children) return false;
        if (Array.isArray(children)) {
          return children.some(
            (child) => isValidElement(child) && findBrElements(child),
          );
        }
        if (isValidElement(children)) {
          return findBrElements(children);
        }

        return false;
      };

      expect(findBrElements(reactMarkup)).toBe(true);
    });
  });

  describe('mixed content rendering', () => {
    it('should return valid React element for hardBreak with other nodes', () => {
      const mixedContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'First line' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Second line' },
            ],
          },
        ],
      };

      const reactMarkup = reactMarkupFromJSON(mixedContent);

      expect(isValidElement(reactMarkup)).toBe(true);
    });
  });

  describe('plain text fallback', () => {
    it('should handle plain string input', () => {
      const plainText = 'This is plain text';

      const reactMarkup = reactMarkupFromJSON(plainText);

      expect(reactMarkup).toBe(plainText);
    });
  });
});
