import { rewriteTriggerVariablesToPayload } from 'src/database/commands/upgrade-version-command/2-15/utils/rewrite-trigger-variables-to-payload.util';

describe('rewriteTriggerVariablesToPayload', () => {
  it('rewrites a flat trigger field reference into the payload node', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload({
      message: 'Hello {{trigger.name}}',
    });

    expect(changed).toBe(true);
    expect(value).toEqual({ message: 'Hello {{trigger.payload.name}}' });
  });

  it('rewrites composite and nested field paths', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload({
      to: '{{trigger.email.primaryEmail}}',
      city: '{{trigger.address.addressCity}}',
    });

    expect(changed).toBe(true);
    expect(value).toEqual({
      to: '{{trigger.payload.email.primaryEmail}}',
      city: '{{trigger.payload.address.addressCity}}',
    });
  });

  it('rewrites bracket-escaped segments', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload(
      '{{trigger.[My Custom Field]}}',
    );

    expect(changed).toBe(true);
    expect(value).toBe('{{trigger.payload.[My Custom Field]}}');
  });

  it('rewrites every occurrence within a value', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload(
      '{{trigger.firstName}} {{trigger.lastName}}',
    );

    expect(changed).toBe(true);
    expect(value).toBe(
      '{{trigger.payload.firstName}} {{trigger.payload.lastName}}',
    );
  });

  it('migrates a field whose name merely starts with "payload"', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload(
      '{{trigger.payloadStatus}}',
    );

    expect(changed).toBe(true);
    expect(value).toBe('{{trigger.payload.payloadStatus}}');
  });

  it('is idempotent for already-migrated references', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload(
      '{{trigger.payload.name}}',
    );

    expect(changed).toBe(false);
    expect(value).toBe('{{trigger.payload.name}}');
  });

  it('leaves metadata references untouched', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload(
      '{{trigger.metadata.workspaceMemberId}}',
    );

    expect(changed).toBe(false);
    expect(value).toBe('{{trigger.metadata.workspaceMemberId}}');
  });

  it('does not touch references to other steps', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload({
      body: '{{a1b2c3.trigger.name}} {{step-2.email}}',
    });

    expect(changed).toBe(false);
    expect(value).toEqual({
      body: '{{a1b2c3.trigger.name}} {{step-2.email}}',
    });
  });

  it('does not touch a bare full-trigger reference', () => {
    const { value, changed } = rewriteTriggerVariablesToPayload('{{trigger}}');

    expect(changed).toBe(false);
    expect(value).toBe('{{trigger}}');
  });

  it('returns null/undefined values unchanged', () => {
    expect(rewriteTriggerVariablesToPayload(null)).toEqual({
      value: null,
      changed: false,
    });
    expect(rewriteTriggerVariablesToPayload(undefined)).toEqual({
      value: undefined,
      changed: false,
    });
  });
});
