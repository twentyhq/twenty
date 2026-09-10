import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

describe('application identifiers', () => {
  it('should expose the application metadata constants', () => {
    expect(APP_DISPLAY_NAME).toBeTruthy();
    expect(typeof APP_DESCRIPTION).toBe('string');
    expect(APPLICATION_UNIVERSAL_IDENTIFIER).toBeTruthy();
  });
});
