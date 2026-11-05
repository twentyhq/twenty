import { Resolver } from 'dns/promises';

import { lookupDnsRecordsState } from 'src/engine/core-modules/dns-manager/utils/lookup-dns-records-state.util';

const mockResolveCname = jest.spyOn(Resolver.prototype, 'resolveCname');
const mockResolveMx = jest.spyOn(Resolver.prototype, 'resolveMx');
const mockResolveTxt = jest.spyOn(Resolver.prototype, 'resolveTxt');

const buildDnsError = (code: string): Error =>
  Object.assign(new Error(`query ${code}`), { code });

const DKIM_RECORD = {
  type: 'CNAME' as const,
  key: 'token._domainkey.example.com',
  value: 'token.dkim.amazonses.com',
};

const MAIL_FROM_MX_RECORD = {
  type: 'MX' as const,
  key: 'twenty-bounce.example.com',
  value: 'feedback-smtp.eu-central-1.amazonses.com',
};

const MAIL_FROM_SPF_RECORD = {
  type: 'TXT' as const,
  key: 'twenty-bounce.example.com',
  value: 'v=spf1 include:amazonses.com ~all',
};

describe('lookupDnsRecordsState', () => {
  beforeEach(() => {
    mockResolveCname.mockRejectedValue(buildDnsError('ENOTFOUND'));
    mockResolveMx.mockRejectedValue(buildDnsError('ENOTFOUND'));
    mockResolveTxt.mockRejectedValue(buildDnsError('ENOTFOUND'));
  });

  it('should report found when every record resolves to its expected value, ignoring hostname case and trailing dots', async () => {
    mockResolveCname.mockResolvedValue(['Token.DKIM.amazonses.com.']);
    mockResolveMx.mockResolvedValue([
      { exchange: 'feedback-smtp.eu-central-1.amazonses.com', priority: 10 },
    ]);
    mockResolveTxt.mockResolvedValue([
      ['google-site-verification=abc'],
      ['v=spf1 include:amazonses', '.com ~all'],
    ]);

    await expect(
      lookupDnsRecordsState([
        DKIM_RECORD,
        MAIL_FROM_MX_RECORD,
        MAIL_FROM_SPF_RECORD,
      ]),
    ).resolves.toBe('found');
  });

  it('should report missing when a record points somewhere else', async () => {
    mockResolveCname.mockResolvedValue(['other.example.net']);

    await expect(lookupDnsRecordsState([DKIM_RECORD])).resolves.toBe('missing');
  });

  it('should report missing when the mail from subdomain has a second MX record', async () => {
    mockResolveMx.mockResolvedValue([
      { exchange: 'feedback-smtp.eu-central-1.amazonses.com', priority: 10 },
      { exchange: 'mx.other-provider.net', priority: 20 },
    ]);

    await expect(lookupDnsRecordsState([MAIL_FROM_MX_RECORD])).resolves.toBe(
      'missing',
    );
  });

  it('should report missing when the mail from subdomain repeats the exchange under another priority', async () => {
    mockResolveMx.mockResolvedValue([
      { exchange: 'feedback-smtp.eu-central-1.amazonses.com', priority: 10 },
      { exchange: 'feedback-smtp.eu-central-1.amazonses.com', priority: 20 },
    ]);

    await expect(lookupDnsRecordsState([MAIL_FROM_MX_RECORD])).resolves.toBe(
      'missing',
    );
  });

  it('should report missing when a TXT value differs only in letter case', async () => {
    mockResolveTxt.mockResolvedValue([
      ['p=migfma0gcsqgsib3dqebaquaa4gnadcbiqkbgqc'],
    ]);

    await expect(
      lookupDnsRecordsState([
        {
          type: 'TXT',
          key: 'resend._domainkey.example.com',
          value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC',
        },
      ]),
    ).resolves.toBe('missing');
  });

  it('should report missing when a record does not exist', async () => {
    mockResolveCname.mockResolvedValue(['token.dkim.amazonses.com']);
    mockResolveMx.mockRejectedValue(buildDnsError('ENOTFOUND'));

    await expect(
      lookupDnsRecordsState([DKIM_RECORD, MAIL_FROM_MX_RECORD]),
    ).resolves.toBe('missing');
  });

  it('should report unknown when the resolver fails or times out instead of answering', async () => {
    mockResolveCname.mockRejectedValue(buildDnsError('SERVFAIL'));
    mockResolveMx.mockRejectedValue(buildDnsError('ETIMEOUT'));

    await expect(
      lookupDnsRecordsState([DKIM_RECORD, MAIL_FROM_MX_RECORD]),
    ).resolves.toBe('unknown');
  });

  it('should report unknown when there is nothing to look up', async () => {
    await expect(lookupDnsRecordsState([])).resolves.toBe('unknown');
  });
});
