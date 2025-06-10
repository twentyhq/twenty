import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';

describe('sanitizeEmailList', () => {
  it('should do nothing if sanitized email list', () => {
    expect(sanitizeEmailList(['toto@toto.com', 'toto2@toto.com'])).toEqual([
      'toto@toto.com',
      'toto2@toto.com',
    ]);
  });
  it('should trim spaces', () => {
    expect(sanitizeEmailList([' toto@toto.com ', '  toto2@toto.com'])).toEqual([
      'toto@toto.com',
      'toto2@toto.com',
    ]);
  });
  it('should filter empty emails', () => {
    expect(sanitizeEmailList(['toto@toto.com', ''])).toEqual(['toto@toto.com']);
  });
  it('should remove duplicates', () => {
    expect(sanitizeEmailList(['toto@toto.com', 'toto@toto.com'])).toEqual([
      'toto@toto.com',
    ]);
  });

  it('should lowercase emails', () => {
    expect(sanitizeEmailList(['TOTO@toto.com', 'TOTO2@toto.com'])).toEqual([
      'toto@toto.com',
      'toto2@toto.com',
    ]);
  });
});
