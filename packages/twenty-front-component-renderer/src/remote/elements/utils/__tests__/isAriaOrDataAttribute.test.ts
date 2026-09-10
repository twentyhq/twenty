import { isAriaOrDataAttribute } from '../isAriaOrDataAttribute';

describe('isAriaOrDataAttribute', () => {
  it('should accept arbitrary aria-* attributes', () => {
    expect(isAriaOrDataAttribute('aria-selected')).toBe(true);
    expect(isAriaOrDataAttribute('aria-activedescendant')).toBe(true);
  });

  it('should accept arbitrary data-* attributes', () => {
    expect(isAriaOrDataAttribute('data-state')).toBe(true);
    expect(isAriaOrDataAttribute('data-radix-collection-item')).toBe(true);
  });

  it('should be case-insensitive on the prefix', () => {
    expect(isAriaOrDataAttribute('DATA-State')).toBe(true);
    expect(isAriaOrDataAttribute('Aria-Label')).toBe(true);
  });

  it('should reject non aria/data attributes', () => {
    expect(isAriaOrDataAttribute('draggable')).toBe(false);
    expect(isAriaOrDataAttribute('class')).toBe(false);
    expect(isAriaOrDataAttribute('href')).toBe(false);
    expect(isAriaOrDataAttribute('onclick')).toBe(false);
    expect(isAriaOrDataAttribute('id')).toBe(false);
  });

  it('should not match names that merely contain the prefix', () => {
    expect(isAriaOrDataAttribute('metadata-id')).toBe(false);
    expect(isAriaOrDataAttribute('x-aria-label')).toBe(false);
  });
});
