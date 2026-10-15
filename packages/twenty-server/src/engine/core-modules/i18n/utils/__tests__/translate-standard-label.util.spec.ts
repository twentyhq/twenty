import { type I18n } from '@lingui/core';

import { generateMessageId } from 'twenty-shared/i18n';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';

jest.mock('twenty-shared/i18n');

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
      applicationCatalog: { 'company-id': 'Entreprise' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Entreprise');
    expect(mockI18n._).not.toHaveBeenCalled();
  });

  it("should fall back to Twenty's catalog when the application catalog has no matching entry", () => {
    mockGenerateMessageId.mockReturnValue('creation-date-id');
    mockI18n._.mockReturnValue('Date de création');

    const result = translateStandardLabel({
      sourceValue: 'Creation date',
      applicationCatalog: {},
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Date de création');
  });

  it("should fall back to Twenty's catalog when the application catalog entry is empty", () => {
    mockGenerateMessageId.mockReturnValue('creation-date-id');
    mockI18n._.mockReturnValue('Date de création');

    const result = translateStandardLabel({
      sourceValue: 'Creation date',
      applicationCatalog: { 'creation-date-id': '' },
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Date de création');
  });

  it('should return the source value when neither catalog has a translation', () => {
    mockGenerateMessageId.mockReturnValue('missing-id');
    mockI18n._.mockReturnValue('missing-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
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
    mockGenerateMessageId.mockReturnValue('company-id');
    mockI18n._.mockReturnValue('company-id');

    const result = translateStandardLabel({
      sourceValue: 'Company',
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Company');
  });

  it('should translate a label Twenty wrote itself when the application has no catalog', () => {
    mockGenerateMessageId.mockReturnValue('go-to-id');
    mockI18n._.mockReturnValue('Aller à {objectLabelPlural}');

    const result = translateStandardLabel({
      sourceValue: 'Go to {objectLabelPlural}',
      context: 'commandMenuItem.label',
      applicationCatalog: undefined,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('Aller à {objectLabelPlural}');
    expect(mockGenerateMessageId).toHaveBeenCalledWith(
      'Go to {objectLabelPlural}',
      'commandMenuItem.label',
    );
  });
});
