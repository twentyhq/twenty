import {
  mapMailgunDnsRecords,
  mapMailgunDomainState,
} from 'src/engine/core-modules/emailing-domain/drivers/mailgun/utils/map-mailgun-domain-verification.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

describe('mapMailgunDomainState', () => {
  it('should map provider states to emailing domain statuses', () => {
    expect(mapMailgunDomainState('active')).toBe(EmailingDomainStatus.VERIFIED);
    expect(mapMailgunDomainState('disabled')).toBe(EmailingDomainStatus.FAILED);
    expect(mapMailgunDomainState('unverified')).toBe(
      EmailingDomainStatus.PENDING,
    );
    expect(mapMailgunDomainState(undefined)).toBe(EmailingDomainStatus.PENDING);
  });
});

describe('mapMailgunDnsRecords', () => {
  it('should map sending records with per-record statuses', () => {
    expect(
      mapMailgunDnsRecords(
        [
          {
            record_type: 'TXT',
            name: 'news.example.com',
            value: 'v=spf1 include:mailgun.org ~all',
            valid: 'valid',
          },
          {
            record_type: 'TXT',
            name: 'k1._domainkey.news.example.com',
            value: 'k=rsa; p=abc',
            valid: 'unknown',
          },
          {
            record_type: 'CNAME',
            name: 'email.news.example.com',
            value: 'mailgun.org',
            valid: 'invalid',
          },
        ],
        'news.example.com',
      ),
    ).toEqual([
      {
        type: 'TXT',
        key: 'news.example.com',
        value: 'v=spf1 include:mailgun.org ~all',
        status: 'success',
      },
      {
        type: 'TXT',
        key: 'k1._domainkey.news.example.com',
        value: 'k=rsa; p=abc',
        status: 'pending',
      },
      {
        type: 'CNAME',
        key: 'email.news.example.com',
        value: 'mailgun.org',
        status: 'error',
      },
    ]);
  });

  it('should fall back to the domain name and coerce MX priorities', () => {
    expect(
      mapMailgunDnsRecords(
        [
          {
            record_type: 'MX',
            value: 'mxa.mailgun.org',
            priority: '10',
            valid: 'unknown',
          },
        ],
        'news.example.com',
      ),
    ).toEqual([
      {
        type: 'MX',
        key: 'news.example.com',
        value: 'mxa.mailgun.org',
        priority: 10,
        status: 'pending',
      },
    ]);
  });

  it('should drop unsupported record types and handle missing records', () => {
    expect(
      mapMailgunDnsRecords(
        [{ record_type: 'A', value: '1.2.3.4' }],
        'news.example.com',
      ),
    ).toEqual([]);
    expect(mapMailgunDnsRecords(undefined, 'news.example.com')).toEqual([]);
  });
});
