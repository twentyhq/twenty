import { APP_DESCRIPTION } from 'src/constants/APP_DESCRIPTION';
import { APP_DISPLAY_NAME } from 'src/constants/APP_DISPLAY_NAME';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/APPLICATION_UNIVERSAL_IDENTIFIER';
import { describe, expect, it } from 'vitest';

describe('application identifiers', () => {
  it('should expose the application metadata constants', () => {
    expect(APP_DISPLAY_NAME).toBeTruthy();
    expect(typeof APP_DESCRIPTION).toBe('string');
    expect(APPLICATION_UNIVERSAL_IDENTIFIER).toBeTruthy();
  });
});
