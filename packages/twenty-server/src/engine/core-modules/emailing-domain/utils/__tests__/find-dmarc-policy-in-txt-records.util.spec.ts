import { findDmarcPolicyInTxtRecords } from 'src/engine/core-modules/emailing-domain/utils/find-dmarc-policy-in-txt-records.util';

describe('findDmarcPolicyInTxtRecords', () => {
  it('should find a policy among unrelated TXT records at the same name', () => {
    expect(
      findDmarcPolicyInTxtRecords([
        ['some-verification-token'],
        ['v=DMARC1; p=reject'],
      ]),
    ).toBe(true);
  });

  it('should join the chunks a long record is split into before matching', () => {
    expect(
      findDmarcPolicyInTxtRecords([
        ['v=DMARC', '1; p=none; rua=mailto:a@b.co'],
      ]),
    ).toBe(true);
  });

  it('should match regardless of case and surrounding whitespace', () => {
    expect(findDmarcPolicyInTxtRecords([['  V=DmArC1; p=none']])).toBe(true);
  });

  it('should not treat an SPF record as a policy', () => {
    expect(
      findDmarcPolicyInTxtRecords([['v=spf1 include:amazonses.com ~all']]),
    ).toBe(false);
  });

  it('should not match a record that only mentions DMARC later on', () => {
    expect(findDmarcPolicyInTxtRecords([['note: v=DMARC1 goes here']])).toBe(
      false,
    );
  });

  it('should report no policy when the name resolves to nothing', () => {
    expect(findDmarcPolicyInTxtRecords([])).toBe(false);
  });
});
