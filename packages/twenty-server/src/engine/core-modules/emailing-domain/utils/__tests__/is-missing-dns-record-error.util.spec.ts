import { isMissingDnsRecordError } from 'src/engine/core-modules/emailing-domain/utils/is-missing-dns-record-error.util';

const buildDnsError = (code: string): Error =>
  Object.assign(new Error(`queryTxt ${code}`), { code });

describe('isMissingDnsRecordError', () => {
  it('should recognise a name that does not exist', () => {
    expect(isMissingDnsRecordError(buildDnsError('ENOTFOUND'))).toBe(true);
  });

  it('should recognise a name that exists without TXT records', () => {
    expect(isMissingDnsRecordError(buildDnsError('ENODATA'))).toBe(true);
  });

  it('should not treat a resolver failure as a missing record', () => {
    expect(isMissingDnsRecordError(buildDnsError('SERVFAIL'))).toBe(false);
  });

  it('should not treat a timeout as a missing record', () => {
    expect(isMissingDnsRecordError(buildDnsError('ETIMEOUT'))).toBe(false);
  });

  it('should reject an error carrying no code', () => {
    expect(isMissingDnsRecordError(new Error('boom'))).toBe(false);
  });

  it('should reject a thrown value that is not an error', () => {
    expect(isMissingDnsRecordError('ENOTFOUND')).toBe(false);
  });
});
