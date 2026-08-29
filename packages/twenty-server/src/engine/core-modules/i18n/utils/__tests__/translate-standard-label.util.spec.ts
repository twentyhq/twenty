import { type I18n } from '@lingui/core';
import { generateMessageId } from '@lingui/message-utils/generateMessageId';

import { generateApplicationMessageId } from 'twenty-shared/i18n';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';

jest.mock('twenty-shared/i18n');
jest.mock('@lingui/message-utils/generateMessageId', () => ({
  generateMessageId: jest.fn(),
}));

// The two ids are mocked separately on purpose: an application catalog is keyed
// with our frozen wire format, the standard bundle with Lingui's own id. Asking
// one of them in the other's key space is the failure this suite guards.
const mockGenerateApplicationMessageId =
  generateApplicationMessageId as jest.MockedFunction<
    typeof generateApplicationMessageId
  >;
const mockGenerateLinguiMessageId = generateMessageId as jest.MockedFunction<
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
    expect(mockGenerateApplicationMessageId).not.toHaveBeenCalled();
    expect(mockGenerateLinguiMessageId).not.toHaveBeenCalled();
  });

  it('should resolve from the application catalog when provided', () => {
    mockGenerateApplicationMessageId.mockReturnValue('company-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: { 'company-id': 'Entreprise' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).not.toHaveBeenCalled();
  });

  it('should key an application catalog with the application id, not the Lingui id', () => {
    mockGenerateApplicationMessageId.mockReturnValue('application-id');
    mockGenerateLinguiMessageId.mockReturnValue('lingui-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: { 'lingui-id': 'Wrong', 'application-id': 'Right' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Right');
    expect(mockGenerateLinguiMessageId).not.toHaveBeenCalled();
  });

  it('should fall back to the source value when the catalog has no matching entry', () => {
    mockGenerateApplicationMessageId.mockReturnValue('missing-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: false,
      applicationCatalog: {},
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Company');
  });

  it('should prefer the catalog over the standard bundle for an application', () => {
    mockGenerateApplicationMessageId.mockReturnValue('company-id');
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

  it('should resolve from the standard bundle with the Lingui id when no catalog is provided', () => {
    mockGenerateLinguiMessageId.mockReturnValue('company-id');
    mockI18n._.mockReturnValue('Entreprise');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      isStandardApp: true,
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).toHaveBeenCalledWith('company-id', {
      objectLabel: '{objectLabel}',
      objectLabelSingular: '{objectLabelSingular}',
      objectLabelPlural: '{objectLabelPlural}',
      objectIcon: '{objectIcon}',
    });
  });

  it('should return the source value when the standard bundle has no translation', () => {
    mockGenerateLinguiMessageId.mockReturnValue('company-id');
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
    expect(mockGenerateApplicationMessageId).not.toHaveBeenCalled();
    expect(mockGenerateLinguiMessageId).not.toHaveBeenCalled();
  });
});
