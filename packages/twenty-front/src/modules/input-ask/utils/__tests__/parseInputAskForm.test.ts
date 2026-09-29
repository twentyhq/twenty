import { parseInputAskForm } from '@/input-ask/utils/parseInputAskForm';

const EMAIL = {
  recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
  subject: 'Renewal',
  body: 'Hi Tim',
};

describe('parseInputAskForm', () => {
  it.each([
    [
      'questions',
      {
        kind: 'questions',
        questions: [{ header: 'Plan', question: 'Which plan?', options: [] }],
      },
    ],
    ['form fields', { kind: 'formFields', fields: [] }],
    ['an email approval', { kind: 'emailApproval', email: EMAIL }],
  ])('reads %s', (_description, form) => {
    expect(parseInputAskForm(form)).toEqual(form);
  });

  it.each([
    ['no form', null],
    ['an unknown kind', { kind: 'signature' }],
    ['questions without any question', { kind: 'questions', questions: [] }],
    [
      'an email without a subject',
      { kind: 'emailApproval', email: { ...EMAIL, subject: undefined } },
    ],
  ])('refuses %s', (_description, form) => {
    expect(parseInputAskForm(form)).toBeNull();
  });
});
