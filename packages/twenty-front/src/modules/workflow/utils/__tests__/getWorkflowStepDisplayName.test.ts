import { WORKFLOW_STEP_DEFAULT_NAMES } from '@/workflow/constants/WorkflowStepDefaultNames';
import { getWorkflowStepDisplayName } from '@/workflow/utils/getWorkflowStepDisplayName';
import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

const SEND_EMAIL_DEFAULT_NAME = WORKFLOW_STEP_DEFAULT_NAMES.find(
  (stepDefaultName) => stepDefaultName.type === 'SEND_EMAIL',
);

const IF_ELSE_DEFAULT_NAMES = WORKFLOW_STEP_DEFAULT_NAMES.filter(
  (stepDefaultName) => stepDefaultName.type === 'IF_ELSE',
);

describe('getWorkflowStepDisplayName', () => {
  beforeEach(() => {
    i18n.load('fr-FR', {
      [SEND_EMAIL_DEFAULT_NAME?.label.id ?? '']: 'Envoyer un e-mail',
      ...Object.fromEntries(
        IF_ELSE_DEFAULT_NAMES.map((stepDefaultName) => [
          stepDefaultName.label.id,
          'Si/sinon',
        ]),
      ),
    });
    i18n.activate('fr-FR');
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the stored default name of the step type', () => {
    expect(
      getWorkflowStepDisplayName({ name: 'Send Email', type: 'SEND_EMAIL' }),
    ).toBe('Envoyer un e-mail');
  });

  it('should translate both stored spellings of the If/else default name', () => {
    expect(
      getWorkflowStepDisplayName({ name: 'If/Else', type: 'IF_ELSE' }),
    ).toBe('Si/sinon');
    expect(
      getWorkflowStepDisplayName({ name: 'If/else', type: 'IF_ELSE' }),
    ).toBe('Si/sinon');
  });

  it('should keep a name the user chose', () => {
    expect(
      getWorkflowStepDisplayName({
        name: 'Send the invoice',
        type: 'SEND_EMAIL',
      }),
    ).toBe('Send the invoice');
  });

  it('should keep a default name stored for another step type', () => {
    expect(
      getWorkflowStepDisplayName({ name: 'Send Email', type: 'DRAFT_EMAIL' }),
    ).toBe('Send Email');
  });
});
