import {
  mapResendDomainRecords,
  mapResendDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-verification.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

describe('mapResendDomainStatus', () => {
  it('should map provider statuses to emailing domain statuses', () => {
    expect(mapResendDomainStatus('verified')).toBe(
      EmailingDomainStatus.VERIFIED,
    );
    expect(mapResendDomainStatus('failure')).toBe(EmailingDomainStatus.FAILED);
    expect(mapResendDomainStatus('failed')).toBe(EmailingDomainStatus.FAILED);
    expect(mapResendDomainStatus('temporary_failure')).toBe(
      EmailingDomainStatus.TEMPORARY_FAILURE,
    );
    expect(mapResendDomainStatus('not_started')).toBe(
      EmailingDomainStatus.PENDING,
    );
    expect(mapResendDomainStatus('pending')).toBe(EmailingDomainStatus.PENDING);
    expect(mapResendDomainStatus(undefined)).toBe(EmailingDomainStatus.PENDING);
  });
});

describe('mapResendDomainRecords', () => {
  it('should map DNS records with per-record statuses and MX priority', () => {
    expect(
      mapResendDomainRecords([
        {
          record: 'SPF',
          name: 'send.example.com',
          type: 'TXT',
          value: 'v=spf1 include:amazonses.com ~all',
          status: 'verified',
        },
        {
          record: 'SPF',
          name: 'send.example.com',
          type: 'MX',
          value: 'feedback-smtp.us-east-1.amazonses.com',
          priority: 10,
          status: 'not_started',
        },
        {
          record: 'DKIM',
          name: 'resend._domainkey.example.com',
          type: 'TXT',
          value: 'p=abc',
          status: 'failed',
        },
      ]),
    ).toEqual([
      {
        type: 'TXT',
        key: 'send.example.com',
        value: 'v=spf1 include:amazonses.com ~all',
        status: 'success',
      },
      {
        type: 'MX',
        key: 'send.example.com',
        value: 'feedback-smtp.us-east-1.amazonses.com',
        priority: 10,
        status: 'pending',
      },
      {
        type: 'TXT',
        key: 'resend._domainkey.example.com',
        value: 'p=abc',
        status: 'error',
      },
    ]);
  });

  it('should drop unsupported record types and handle missing records', () => {
    expect(
      mapResendDomainRecords([
        {
          record: 'Custom',
          name: 'x.example.com',
          type: 'A',
          value: '1.2.3.4',
        },
      ]),
    ).toEqual([]);
    expect(mapResendDomainRecords(undefined)).toEqual([]);
  });
});
