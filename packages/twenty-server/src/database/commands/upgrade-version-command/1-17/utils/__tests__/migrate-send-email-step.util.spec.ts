import {
  migrateInput,
  migrateWorkflowSteps,
  needsMigration,
} from 'src/database/commands/upgrade-version-command/1-17/utils/migrate-send-email-step.util';

const LEGACY_STEP_FROM_PRODUCTION = {
  id: '3b8934cd-1dda-4acb-a050-785e04f7f40b',
  name: 'Send Email',
  type: 'SEND_EMAIL',
  valid: false,
  position: { x: 0, y: 150 },
  settings: {
    input: {
      body: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"sample"}]}]}',
      email: 'sample@gmail.com',
      files: [],
      subject: 'sample',
      connectedAccountId: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
};

describe('needsMigration', () => {
  it('returns true for legacy email field', () => {
    expect(
      needsMigration({ connectedAccountId: '', email: 'test@example.com' }),
    ).toBe(true);
  });

  it('returns false when recipients is already used', () => {
    expect(
      needsMigration({
        connectedAccountId: '',
        recipients: { to: 'test@example.com' },
      }),
    ).toBe(false);
  });
});

describe('migrateInput', () => {
  it('converts legacy email to recipients.to', () => {
    const result = migrateInput({
      connectedAccountId: 'acc-123',
      email: 'legacy@example.com',
      subject: 'Test',
      body: 'Body',
    });

    expect(result.recipients.to).toBe('legacy@example.com');
    expect(result).not.toHaveProperty('email');
  });
});

describe('migrateWorkflowSteps', () => {
  it('migrates real production workflow with legacy email field', () => {
    const { migratedSteps, hasChanges } = migrateWorkflowSteps([
      LEGACY_STEP_FROM_PRODUCTION,
    ]);

    expect(hasChanges).toBe(true);
    expect(migratedSteps[0].settings.input).toEqual({
      body: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"sample"}]}]}',
      files: [],
      subject: 'sample',
      connectedAccountId: '',
      recipients: {
        to: 'sample@gmail.com',
        cc: '',
        bcc: '',
      },
    });
  });

  it('returns hasChanges false when no migration needed', () => {
    const alreadyMigratedStep = {
      ...LEGACY_STEP_FROM_PRODUCTION,
      settings: {
        ...LEGACY_STEP_FROM_PRODUCTION.settings,
        input: {
          connectedAccountId: '',
          recipients: { to: 'new@example.com', cc: '', bcc: '' },
          subject: 'Test',
          body: 'Body',
        },
      },
    };

    const { hasChanges } = migrateWorkflowSteps([alreadyMigratedStep]);

    expect(hasChanges).toBe(false);
  });
});
