import { containsDmarcPolicy } from 'src/engine/core-modules/emailing-domain/utils/contains-dmarc-policy.util';

describe('containsDmarcPolicy', () => {
  it('should find a policy among unrelated TXT records at the same name', () => {
    expect(
      containsDmarcPolicy([
        ['some-verification-token'],
        ['v=DMARC1; p=reject'],
      ]),
    ).toBe(true);
  });

  it('should join the chunks a long record is split into before matching', () => {
    expect(
      containsDmarcPolicy([['v=DMARC', '1; p=none; rua=mailto:a@b.co']]),
    ).toBe(true);
  });

  it('should match regardless of case and surrounding whitespace', () => {
    expect(containsDmarcPolicy([['  V=DmArC1; p=none']])).toBe(true);
  });

  it('should not treat an SPF record as a policy', () => {
    expect(containsDmarcPolicy([['v=spf1 include:amazonses.com ~all']])).toBe(
      false,
    );
  });

  it('should not match a record that only mentions the version tag later on', () => {
    expect(containsDmarcPolicy([['note: v=DMARC1 goes here']])).toBe(false);
  });

  it('should report no policy when the name resolves to nothing', () => {
    expect(containsDmarcPolicy([])).toBe(false);
  });
});
