import { isFileInputType } from '../isFileInputType';

describe('isFileInputType', () => {
  it('should recognize the file input type whatever its casing', () => {
    expect(isFileInputType('file')).toBe(true);
    expect(isFileInputType('FILE')).toBe(true);
  });

  it('should not treat other or missing input types as file inputs', () => {
    expect(isFileInputType('text')).toBe(false);
    expect(isFileInputType('checkbox')).toBe(false);
    expect(isFileInputType(undefined)).toBe(false);
  });
});
