import { FieldMetadataType } from 'twenty-shared/types';
import { CsvColumn } from '../types/CsvColumn';
import { CsvRow } from '../types/CsvRow';

export const parseCsvColumns = (csvContent: string): CsvColumn[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1, Math.min(4, lines.length));
  return headers.map((header, headerIndex) => ({
    name: header,
    sampleData: dataLines
      .map((line) => {
        const values = line.split(',');
        return values[headerIndex]?.trim().replace(/"/g, '') || '';
      })
      .filter(Boolean),
  }));
};

export const parseCsvRows = (csvContent: string): CsvRow[] => {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1);
  return dataLines.map((line) => {
    const values = line.split(',');
    const row: CsvRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim().replace(/"/g, '') ?? '';
    });
    return row;
  });
};

export const convertCsvValueToFieldType = (
  csvValue: string,
  fieldType: string,
): any => {
  if (!csvValue || csvValue.trim() === '') return null;
  const trimmedValue = csvValue.trim();
  switch (fieldType) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.PHONES:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.RICH_TEXT:
      return trimmedValue;
    case FieldMetadataType.NUMBER: {
      const numberValue = parseFloat(trimmedValue);
      return isNaN(numberValue) ? null : numberValue;
    }
    case FieldMetadataType.BOOLEAN: {
      const lowerValue = trimmedValue.toLowerCase();
      return (
        lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
      );
    }
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      try {
        const dateValue = new Date(trimmedValue);
        return isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
      } catch {
        //todo
        return null;
      }
    case FieldMetadataType.RATING: {
      if (!/^\d+$/.test(trimmedValue)) {
        return null;
      }

      const ratingValue = parseInt(trimmedValue, 10);
      return isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5
        ? null
        : ratingValue;
    }
    case FieldMetadataType.RAW_JSON: {
      try {
        return JSON.parse(trimmedValue);
      } catch {
        return trimmedValue;
      }
    }
    case FieldMetadataType.ARRAY: {
      try {
        const parsed = JSON.parse(trimmedValue);
        return Array.isArray(parsed) ? parsed : [trimmedValue];
      } catch {
        return trimmedValue
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    default:
      return trimmedValue;
  }
};
