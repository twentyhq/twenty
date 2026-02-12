import { getMultiItemFieldEditorContent } from '@/workflow/workflow-variables/utils/getMultiItemFieldEditorContent';
import { parseMultiItemEditorContent } from '@/workflow/workflow-variables/utils/parseMultiItemEditorContent';

describe('getMultiItemFieldEditorContent', () => {
  it('should parse plain emails as textTags', () => {
    const result = getMultiItemFieldEditorContent(
      'first@example.com, second@example.com',
    );

    expect(result.content?.[0]?.content).toEqual([
      { type: 'textTag', attrs: { text: 'first@example.com' } },
      { type: 'textTag', attrs: { text: 'second@example.com' } },
    ]);
  });

  it('should parse standalone variables as variableTags', () => {
    const result = getMultiItemFieldEditorContent(
      '{{user.email}}, {{trigger.record.email}}',
    );

    expect(result.content?.[0]?.content).toEqual([
      { type: 'variableTag', attrs: { variable: '{{user.email}}' } },
      { type: 'variableTag', attrs: { variable: '{{trigger.record.email}}' } },
    ]);
  });

  it('should handle mixed emails and variables', () => {
    const result = getMultiItemFieldEditorContent(
      '{{trigger.record.email}}, sales@company.com, {{user.managerEmail}}',
    );

    expect(result.content?.[0]?.content).toEqual([
      { type: 'variableTag', attrs: { variable: '{{trigger.record.email}}' } },
      { type: 'textTag', attrs: { text: 'sales@company.com' } },
      { type: 'variableTag', attrs: { variable: '{{user.managerEmail}}' } },
    ]);
  });

  it('should treat embedded variables as plain text (not standalone)', () => {
    const result = getMultiItemFieldEditorContent('hello {{user.email}}');

    expect(result.content?.[0]?.content).toEqual([
      { type: 'textTag', attrs: { text: 'hello {{user.email}}' } },
    ]);
  });

  it('should skip empty entries from extra commas or whitespace', () => {
    const result = getMultiItemFieldEditorContent(
      'first@example.com, , , second@example.com,  ',
    );

    expect(result.content?.[0]?.content).toHaveLength(2);
  });

  it('should roundtrip correctly with parseMultiItemEditorContent', () => {
    const original =
      '{{trigger.record.email}}, static@example.com, {{user.email}}';
    const content = getMultiItemFieldEditorContent(original);
    const serialized = parseMultiItemEditorContent(content);

    expect(serialized).toBe(original);
  });
});
