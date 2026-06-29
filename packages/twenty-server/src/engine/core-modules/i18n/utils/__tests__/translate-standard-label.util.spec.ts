import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('translateStandardLabel', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
  });

  it('should return the source value when it is empty', () => {
    const result = translateStandardLabel({
      sourceValue: '',
      isStandardApp: true,
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('');
    expect(mockGenerateMessageId).not.toHaveBeenCalled();
  });

  it('should resolve from the application catalog when provided', () => {
    mockGenerateMessageId.mockReturnValue('company-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: { 'company-id': 'Entreprise' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).not.toHaveBeenCalled();
  });

  it('should fall back to the source value when the catalog has no matching entry', () => {
    mockGenerateMessageId.mockReturnValue('missing-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: {},
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Company');
  });

  it('should prefer the catalog over the standard bundle for an application', () => {
    mockGenerateMessageId.mockReturnValue('company-id');
    mockI18n._.mockReturnValue('Bundle Translation');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: true,
      applicationCatalog: { 'company-id': 'Entreprise' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).not.toHaveBeenCalled();
  });

  it('should resolve from the standard bundle when no catalog is provided', () => {
    mockGenerateMessageId.mockReturnValue('company-id');
    mockI18n._.mockReturnValue('Entreprise');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: true,
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).toHaveBeenCalledWith('company-id');
  });

  it('should return the source value when the standard bundle has no translation', () => {
    mockGenerateMessageId.mockReturnValue('company-id');
    mockI18n._.mockReturnValue('company-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: true,
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Company');
  });

  it('should return the source value for a non-standard app without a catalog', () => {
    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Company');
    expect(mockGenerateMessageId).not.toHaveBeenCalled();
  });
});
