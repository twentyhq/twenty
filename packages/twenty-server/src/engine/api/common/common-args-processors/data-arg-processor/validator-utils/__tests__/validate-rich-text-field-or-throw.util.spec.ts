import { validateRichTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-rich-text-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateRichTextFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateRichTextFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return value when value is an empty object', () => {
      const result = validateRichTextFieldOrThrow({}, 'testField');

      expect(result).toEqual({});
    });

    it('should return the value when it has valid subfields', () => {
      const value = {
        blocknote:
          '[{"type":"paragraph","content":[{"type":"text","text":"test"}]}]',
        markdown: '# Heading\nContent',
      };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return the value when blocknote is null', () => {
      const value = { blocknote: null, markdown: 'test' };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });

    it('should return the value when only markdown is provided', () => {
      const value = { markdown: '# Heading' };
      const result = validateRichTextFieldOrThrow(value, 'testField');

      expect(result).toEqual(value);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() =>
        validateRichTextFieldOrThrow(undefined, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is a string', () => {
      expect(() =>
        validateRichTextFieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value has invalid subfields', () => {
      const value = { invalidField: 'value' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Invalid subfield.*invalidField.*rich text field/,
      );
    });

    it('should throw when blocknote contains invalid JSON', () => {
      const value = { blocknote: 'not-valid-json' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /must contain valid JSON/,
      );
    });

    it('should throw when blocknote is valid JSON but not an array', () => {
      const value = { blocknote: '{"type":"paragraph"}' };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /must be a JSON array of blocks/,
      );
    });

    it('should return the value when tiptap is a rich text document', () => {
      const value = {
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        }),
      };

      expect(validateRichTextFieldOrThrow(value, 'testField')).toEqual(value);
    });

    it('should accept a toggle only when it starts with a paragraph or a heading', () => {
      const toToggleValue = (summary: object) => ({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'toggle',
              attrs: { id: 'toggle-id', indent: 1 },
              content: [summary, { type: 'paragraph' }],
            },
          ],
        }),
      });
      const headingToggleValue = toToggleValue({
        type: 'heading',
        attrs: { level: 6 },
      });

      expect(
        validateRichTextFieldOrThrow(headingToggleValue, 'testField'),
      ).toEqual(headingToggleValue);
      expect(() =>
        validateRichTextFieldOrThrow(
          toToggleValue({ type: 'divider' }),
          'testField',
        ),
      ).toThrow(/Invalid tiptap value/);
    });

    it('should throw when tiptap holds nodes a rich text field cannot store', () => {
      const value = {
        tiptap: JSON.stringify({
          type: 'doc',
          content: [{ type: 'button', attrs: { href: 'https://twenty.com' } }],
        }),
      };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Invalid tiptap value/,
      );
    });

    it('should throw when a tiptap image points to a dangerous protocol', () => {
      const value = {
        tiptap: JSON.stringify({
          type: 'doc',
          content: [{ type: 'image', attrs: { src: 'javascript:alert(1)' } }],
        }),
      };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Dangerous URL protocol/,
      );
    });

    it('should throw when a tiptap link hides its href key behind a JSON escape', () => {
      const value = {
        tiptap:
          '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Click","marks":[{"type":"link","attrs":{"\\u0068ref":"javascript:alert(1)"}}]}]}]}',
      };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Dangerous URL protocol/,
      );
    });

    it('should throw when a blocknote link hides its href key behind a JSON escape', () => {
      const value = {
        blocknote:
          '[{"type":"paragraph","content":[{"type":"link","\\u0068ref":"javascript:alert(1)","content":[]}]}]',
      };

      expect(() => validateRichTextFieldOrThrow(value, 'testField')).toThrow(
        /Dangerous URL protocol in blocknote content/,
      );
    });
  });
});
