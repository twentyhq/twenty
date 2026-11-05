import { isNonEmptyBlob } from '@/front-components/utils/isNonEmptyBlob';

describe('isNonEmptyBlob', () => {
  it('accepts a blob holding data', () => {
    expect(isNonEmptyBlob(new Blob(['recording']))).toBe(true);
  });

  it('rejects an empty blob', () => {
    expect(isNonEmptyBlob(new Blob([]))).toBe(false);
  });

  it('rejects a value that is not a blob', () => {
    expect(isNonEmptyBlob('not-a-blob')).toBe(false);
  });
});
