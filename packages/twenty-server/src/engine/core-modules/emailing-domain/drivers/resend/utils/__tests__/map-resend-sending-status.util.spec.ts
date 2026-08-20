import { mapResendSendingStatus } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-sending-status.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

const sendingRecord = (status: string) => ({
  record: 'SPF',
  name: 'send.example.com',
  type: 'TXT',
  value: 'v=spf1 include:amazonses.com ~all',
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

describe('mapResendSendingStatus', () => {
  it('should report a fully verified domain as verified', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'verified',
      }),
    ).toBe(EmailingDomainStatus.VERIFIED);
  });

  it('should report a partially verified domain as verified when sending records are verified', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'partially_verified',
        records: [
          sendingRecord('verified'),
          { ...sendingRecord('verified'), record: 'DKIM' },
          receivingRecord('pending'),
        ],
      }),
    ).toBe(EmailingDomainStatus.VERIFIED);
  });

  it('should stay pending while sending records are pending', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'partially_verified',
        records: [
          sendingRecord('verified'),
          { ...sendingRecord('pending'), record: 'DKIM' },
          receivingRecord('verified'),
        ],
      }),
    ).toBe(EmailingDomainStatus.PENDING);
  });

  it('should report failure when a sending record failed', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'partially_failed',
        records: [
          sendingRecord('failure'),
          { ...sendingRecord('verified'), record: 'DKIM' },
        ],
      }),
    ).toBe(EmailingDomainStatus.FAILED);
  });

  it('should report temporary failure when a sending record is temporarily failing', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'temporary_failure',
        records: [
          sendingRecord('temporary_failure'),
          { ...sendingRecord('verified'), record: 'DKIM' },
        ],
      }),
    ).toBe(EmailingDomainStatus.TEMPORARY_FAILURE);
  });

  it('should fall back to the aggregate status without records', () => {
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'failure',
      }),
    ).toBe(EmailingDomainStatus.FAILED);
    expect(
      mapResendSendingStatus({
        id: 'dom_1',
        name: 'example.com',
        status: 'pending',
        records: [receivingRecord('pending')],
      }),
    ).toBe(EmailingDomainStatus.PENDING);
  });
});
