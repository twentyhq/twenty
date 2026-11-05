import { findResendGivenUpChecks } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/find-resend-given-up-checks.util';

const spfRecord = (status: string) => ({
  record: 'SPF',
  name: 'send.example.com',
  type: 'MX',
  value: 'feedback-smtp.eu-west-1.amazonses.com',
  priority: 10,
  status,
});

const dkimRecord = (status: string) => ({
  record: 'DKIM',
  name: 'resend._domainkey.example.com',
  type: 'TXT',
  value: 'p=MIGfMA0',
  status,
});

const receivingRecord = (status: string) => ({
  record: 'MX',
  name: 'example.com',
  type: 'MX',
  value: 'inbound.resend.com',
  priority: 10,
  status,
});

describe('findResendGivenUpChecks', () => {
  it('should report nothing while Resend is still checking or has verified', () => {
    expect(
      findResendGivenUpChecks({
        id: 'dom_1',
        name: 'example.com',
        status: 'pending',
        records: [spfRecord('pending'), dkimRecord('verified')],
      }),
    ).toEqual([]);
  });

  it('should report only the check whose records failed, with those records', () => {
    expect(
      findResendGivenUpChecks({
        id: 'dom_1',
        name: 'example.com',
        status: 'failed',
        records: [spfRecord('verified'), dkimRecord('failed')],
      }),
    ).toEqual([
      {
        name: 'DKIM',
        records: [
          {
            type: 'TXT',
            key: 'resend._domainkey.example.com',
            value: 'p=MIGfMA0',
            status: 'error',
          },
        ],
      },
    ]);
  });

  it('should report a check that never started so it can be kicked off', () => {
    expect(
      findResendGivenUpChecks({
        id: 'dom_1',
        name: 'example.com',
        status: 'not_started',
        records: [spfRecord('not_started'), dkimRecord('not_started')],
      }).map(({ name }) => name),
    ).toEqual(['DKIM', 'MAIL_FROM']);
  });

  it('should ignore a failed receiving MX record since it does not gate sending', () => {
    expect(
      findResendGivenUpChecks({
        id: 'dom_1',
        name: 'example.com',
        status: 'partially_failed',
        records: [
          spfRecord('verified'),
          dkimRecord('verified'),
          receivingRecord('failed'),
        ],
      }),
    ).toEqual([]);
  });
});
