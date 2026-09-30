import { FieldMetadataType } from 'twenty-shared/types';

import { REQUEST_FORM_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';

const FIELDS = [
  { name: 'company', label: 'Company', type: 'RECORD' as const },
  {
    name: 'closeDate',
    label: 'Close date',
    type: FieldMetadataType.DATE,
  },
];

const parseCall = () => {
  const call = REQUEST_FORM_PAUSING_TOOL.parseCall({ fields: FIELDS });

  if (call === null) {
    throw new Error('Expected the call to parse');
  }

  return call;
};

const NO_TOOLS = { executeTool: jest.fn() };

describe('REQUEST_FORM_PAUSING_TOOL', () => {
  it('cannot read a form without fields, or with two fields of the same name', () => {
    expect(REQUEST_FORM_PAUSING_TOOL.parseCall({ fields: [] })).toBeNull();
    expect(
      REQUEST_FORM_PAUSING_TOOL.parseCall({ fields: [FIELDS[0], FIELDS[0]] }),
    ).toBeNull();
  });

  it('reads the fields of a workflow form step', () => {
    expect(
      REQUEST_FORM_PAUSING_TOOL.parseCall({
        fields: [{ ...FIELDS[1], id: 'field-1', value: '2026-10-01' }],
      }),
    ).not.toBeNull();
  });

  it('refuses a value for a field the form does not have', () => {
    expect(parseCall().validate({ stage: 'Won' })).toEqual({
      isValid: false,
      errorMessage: 'The form has no field named stage.',
    });
  });

  it('turns the submitted values into the answered result and the answer message', async () => {
    const values = { company: { id: 'company-1' }, closeDate: '2026-10-15' };

    expect(
      await parseCall().complete({ output: values, context: NO_TOOLS }),
    ).toEqual({
      toolResult: {
        success: true,
        message: 'User submitted the form.',
        result: { status: 'answered', values },
      },
      answerText: 'Company: {"id":"company-1"}\nClose date: 2026-10-15',
    });
  });

  it('closes a skipped form without values', () => {
    expect(parseCall().toSkippedToolResult()).toEqual({
      success: true,
      message: 'User skipped the form and sent another message instead.',
      result: { status: 'skipped' },
    });
  });
});
