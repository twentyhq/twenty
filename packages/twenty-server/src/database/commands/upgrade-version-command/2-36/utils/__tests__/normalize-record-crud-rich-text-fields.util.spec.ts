import { normalizeRecordCrudRichTextFieldsInSteps } from 'src/database/commands/upgrade-version-command/2-36/utils/normalize-record-crud-rich-text-fields.util';

const richTextFieldNamesByObjectName = { person: ['relationshipSummary'] };

const buildStep = (objectRecord: Record<string, unknown>) => ({
  id: 'step-1',
  name: 'Create person',
  type: 'CREATE_RECORD',
  settings: { input: { objectName: 'person', objectRecord } },
});

describe('normalizeRecordCrudRichTextFieldsInSteps', () => {
  it('wraps a bare-string rich text field into the markdown object shape', () => {
    const steps = [
      buildStep({
        name: 'Amina',
        relationshipSummary: 'Latest donation: {{trigger.body.amount}}',
      }),
    ];

    const { value, changed } = normalizeRecordCrudRichTextFieldsInSteps({
      steps,
      richTextFieldNamesByObjectName,
    });

    expect(changed).toBe(true);
    expect((value as typeof steps)[0].settings.input.objectRecord).toEqual({
      name: 'Amina',
      relationshipSummary: {
        blocknote: null,
        markdown: 'Latest donation: {{trigger.body.amount}}',
      },
    });
  });

  it('leaves an already-object rich text value untouched', () => {
    const steps = [
      buildStep({ relationshipSummary: { blocknote: '[]', markdown: null } }),
    ];

    const { value, changed } = normalizeRecordCrudRichTextFieldsInSteps({
      steps,
      richTextFieldNamesByObjectName,
    });

    expect(changed).toBe(false);
    expect(value).toBe(steps);
  });

  it('does not touch non-rich-text string fields', () => {
    const steps = [buildStep({ name: 'Amina' })];

    const { changed } = normalizeRecordCrudRichTextFieldsInSteps({
      steps,
      richTextFieldNamesByObjectName,
    });

    expect(changed).toBe(false);
  });

  it('ignores steps that are not record-crud with an object record', () => {
    const steps = [
      {
        id: 'step-1',
        type: 'SEND_EMAIL',
        settings: { input: { relationshipSummary: 'not a record field' } },
      },
    ];

    const { changed } = normalizeRecordCrudRichTextFieldsInSteps({
      steps,
      richTextFieldNamesByObjectName,
    });

    expect(changed).toBe(false);
  });

  it('returns steps unchanged when steps is not an array', () => {
    const { value, changed } = normalizeRecordCrudRichTextFieldsInSteps({
      steps: null,
      richTextFieldNamesByObjectName,
    });

    expect(changed).toBe(false);
    expect(value).toBeNull();
  });
});
