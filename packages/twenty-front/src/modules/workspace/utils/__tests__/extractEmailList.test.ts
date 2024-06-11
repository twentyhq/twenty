import { extractEmailsList } from '@/workspace/utils/extractEmailList';

describe('extractEmailList', () => {
  it('should extract email list', () => {
    expect(extractEmailsList('toto@toto.com')).toEqual(['toto@toto.com']);
  });
  it('should extract email list with multiple emails', () => {
    expect(extractEmailsList('toto@toto.com,toto2@toto.com')).toEqual([
      'toto@toto.com',
      'toto2@toto.com',
    ]);
  });
  it('should extract email list with multiple emails and wrong emails', () => {
    expect(extractEmailsList('toto@toto.com,toto2@toto.com,toto')).toEqual([
      'toto@toto.com',
      'toto2@toto.com',
      'toto',
    ]);
  });
  it('should remove duplicates', () => {
    expect(extractEmailsList('toto@toto.com,toto@toto.com')).toEqual([
      'toto@toto.com',
    ]);
  });
  it('should remove empty emails', () => {
    expect(extractEmailsList('toto@toto.com,')).toEqual(['toto@toto.com']);
  });
});
