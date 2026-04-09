import { NumberFormat } from '@/localization/constants/NumberFormat';
import {
  getSeparatorsForNumberFormat,
  type NumberFormatSeparators,
} from '~/utils/format/getSeparatorsForNumberFormat';

const expectSeparators = (
  format: NumberFormat,
  expected: NumberFormatSeparators,
) => {
  expect(getSeparatorsForNumberFormat(format)).toEqual(expected);
};

describe('getSeparatorsForNumberFormat', () => {
  it('returns comma thousands and dot radix for COMMAS_AND_DOT', () => {
    expectSeparators(NumberFormat.COMMAS_AND_DOT, {
      thousandsSeparator: ',',
      radix: '.',
    });
  });

  it('returns space thousands and comma radix for SPACES_AND_COMMA', () => {
    expectSeparators(NumberFormat.SPACES_AND_COMMA, {
      thousandsSeparator: ' ',
      radix: ',',
    });
  });

  it('returns dot thousands and comma radix for DOTS_AND_COMMA', () => {
    expectSeparators(NumberFormat.DOTS_AND_COMMA, {
      thousandsSeparator: '.',
      radix: ',',
    });
  });

  it('returns apostrophe thousands and dot radix for APOSTROPHE_AND_DOT', () => {
    expectSeparators(NumberFormat.APOSTROPHE_AND_DOT, {
      thousandsSeparator: "'",
      radix: '.',
    });
  });

  it('falls back to COMMAS_AND_DOT separators for SYSTEM', () => {
    expectSeparators(NumberFormat.SYSTEM, {
      thousandsSeparator: ',',
      radix: '.',
    });
  });
});
