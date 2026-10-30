import { computeSetuAiActionPayloadHash } from 'src/engine/metadata-modules/ai/ai-actions/utils/compute-setu-ai-action-payload-hash.util';
import { getSetuAiActionAllowedOperations } from 'src/engine/metadata-modules/ai/ai-actions/utils/get-setu-ai-action-allowed-operations.util';
import { toSetuAiActionProposalInput } from 'src/engine/metadata-modules/ai/ai-actions/utils/to-setu-ai-action-proposal-input.util';

describe('Setu AI action utils', () => {
  it('hashes payloads independently of key order', () => {
    expect(computeSetuAiActionPayloadHash({ a: 1, b: { c: 2, d: 3 } })).toBe(
      computeSetuAiActionPayloadHash({ b: { d: 3, c: 2 }, a: 1 }),
    );
    expect(computeSetuAiActionPayloadHash({ a: 1 })).not.toBe(
      computeSetuAiActionPayloadHash({ a: 2 }),
    );
  });

  it('offers decisions only while an action can still be stopped', () => {
    expect(getSetuAiActionAllowedOperations('pending_review')).toEqual([
      'revise',
      'approve',
      'reject',
    ]);
    expect(getSetuAiActionAllowedOperations('queued')).toEqual([
      'revise',
      'cancel',
    ]);
    expect(getSetuAiActionAllowedOperations('running')).toEqual([]);
    expect(getSetuAiActionAllowedOperations('delivery_unknown')).toEqual([]);
    expect(getSetuAiActionAllowedOperations('succeeded')).toEqual([]);
  });

  it('maps a native send_email call onto a proposal', () => {
    expect(
      toSetuAiActionProposalInput({
        kind: 'send_email',
        toolName: 'send_email',
        arguments: {
          recipients: { to: 'buyer@example.com', cc: '', bcc: '' },
          subject: 'Follow-up',
          body: '<p>Hi</p>',
        },
      }),
    ).toEqual({
      kind: 'send_email',
      sendEmail: {
        to: 'buyer@example.com',
        cc: '',
        bcc: '',
        subject: 'Follow-up',
        body: ' Hi ',
      },
    });
  });

  it('refuses attachments on a native send', () => {
    expect(() =>
      toSetuAiActionProposalInput({
        kind: 'send_email',
        toolName: 'send_email',
        arguments: {
          recipients: { to: 'buyer@example.com' },
          subject: 'Deck',
          body: 'Attached',
          files: [{ id: 'file-id' }],
        },
      }),
    ).toThrow();
  });

  it('maps a native update_one call onto a record change', () => {
    expect(
      toSetuAiActionProposalInput({
        kind: 'update_record_fields',
        objectNameSingular: 'opportunity',
        toolName: 'update_opportunity',
        arguments: { id: 'record-id', stage: 'WON', amount: undefined },
      }),
    ).toEqual({
      kind: 'update_record_fields',
      updateRecordFields: {
        objectNameSingular: 'opportunity',
        recordId: 'record-id',
        fields: { stage: 'WON' },
      },
    });
  });
});
