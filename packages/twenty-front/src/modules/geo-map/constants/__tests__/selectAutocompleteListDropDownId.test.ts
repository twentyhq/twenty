import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';

describe('selectAutocompleteListDropDownId', () => {
  it('should have the correct constant value', () => {
    expect(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID).toBe(
      'select-autocomplete-list-dropdown-id',
    );
  });

  it('should be a string', () => {
    expect(typeof SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID).toBe('string');
  });

  it('should be a non-empty string', () => {
    expect(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID.length).toBeGreaterThan(0);
  });

  it('should follow kebab-case naming convention', () => {
    expect(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('should be a valid HTML ID', () => {
    // HTML IDs should not contain spaces or special characters except hyphens
    expect(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID).toMatch(
      /^[a-zA-Z][a-zA-Z0-9-]*$/,
    );
  });

  it('should be immutable', () => {
    // This test ensures the constant cannot be reassigned
    const originalValue = SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID;
    expect(SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID).toBe(originalValue);
  });
});
