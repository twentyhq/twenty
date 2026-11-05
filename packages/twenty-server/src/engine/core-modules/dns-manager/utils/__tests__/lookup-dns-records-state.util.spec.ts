import { lookupDnsRecordsState } from 'src/engine/core-modules/dns-manager/utils/lookup-dns-records-state.util';

const mockResolveCname = jest.fn();
const mockResolveMx = jest.fn();
const mockResolveTxt = jest.fn();

jest.mock('dns/promises', () => ({
  Resolver: jest.fn().mockImplementation(() => ({
    resolveCname: mockResolveCname,
    resolveMx: mockResolveMx,
    resolveTxt: mockResolveTxt,
  })),
}));

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
    mockResolveCname.mockReset();
    mockResolveMx.mockReset();
    mockResolveTxt.mockReset();
  });

  it('should report found when every record resolves to its expected value, ignoring case and trailing dots', async () => {
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
