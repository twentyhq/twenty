import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ViewFilterOperand } from 'twenty-shared/types';

import { useGetRecordFilterDisplayValue } from '@/object-record/record-filter/hooks/useGetRecordFilterDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { messages } from '~/locales/generated/en';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <BaseWrapper>{children}</BaseWrapper>
  </I18nProvider>
);

const buildActorSourceFilter = (
  sourceIds: string[],
  displayValue: string,
): RecordFilter => ({
  id: 'actor-source-filter',
  fieldMetadataId: 'created-by-field',
  value: JSON.stringify(sourceIds),
  displayValue,
  type: 'ACTOR',
  operand: ViewFilterOperand.IS,
  label: 'Created by',
  subFieldName: 'source',
});

const renderGetRecordFilterDisplayValue = () =>
  renderHook(() => useGetRecordFilterDisplayValue(), { wrapper: Wrapper })
    .result.current.getRecordFilterDisplayValue;

describe('useGetRecordFilterDisplayValue', () => {
  describe('actor source filters', () => {
    it('displays the label of every known source', () => {
      const getRecordFilterDisplayValue = renderGetRecordFilterDisplayValue();

      expect(
        getRecordFilterDisplayValue(
          buildActorSourceFilter(['EMAIL', 'API'], 'stored label'),
        ),
      ).toBe('API, Email');
    });

    it('keeps the stored label for a source that has no filter option', () => {
      const getRecordFilterDisplayValue = renderGetRecordFilterDisplayValue();

      expect(
        getRecordFilterDisplayValue(buildActorSourceFilter(['AGENT'], 'Agent')),
      ).toBe('Agent');
    });

    it('keeps the stored label when known and unknown sources are mixed', () => {
      const getRecordFilterDisplayValue = renderGetRecordFilterDisplayValue();

      expect(
        getRecordFilterDisplayValue(
          buildActorSourceFilter(
            ['EMAIL', 'APPLICATION'],
            'Email, Application',
          ),
        ),
      ).toBe('Email, Application');
    });
  });

  describe('date filters', () => {
    const buildDateFilter = (operand: ViewFilterOperand): RecordFilter => ({
      id: 'date-filter',
      fieldMetadataId: 'close-date-field',
      value: '2026-03-15',
      displayValue: '2026-03-15',
      type: 'DATE',
      operand,
      label: 'Close date',
    });

    it('formats is before and is after like an exact date', () => {
      const getRecordFilterDisplayValue = renderGetRecordFilterDisplayValue();

      const exactDateDisplayValue = getRecordFilterDisplayValue(
        buildDateFilter(ViewFilterOperand.IS),
      );

      expect(exactDateDisplayValue).not.toBe('2026-03-15');
      expect(
        getRecordFilterDisplayValue(
          buildDateFilter(ViewFilterOperand.IS_BEFORE),
        ),
      ).toBe(exactDateDisplayValue);
      expect(
        getRecordFilterDisplayValue(
          buildDateFilter(ViewFilterOperand.IS_AFTER),
        ),
      ).toBe(exactDateDisplayValue);
    });
  });

  describe('address country filters', () => {
    it('derives the label from the stored country names', () => {
      const getRecordFilterDisplayValue = renderGetRecordFilterDisplayValue();

      expect(
        getRecordFilterDisplayValue({
          id: 'country-filter',
          fieldMetadataId: 'address-field',
          value: JSON.stringify(['France', 'Germany']),
          displayValue: '["France","Germany"]',
          type: 'ADDRESS',
          operand: ViewFilterOperand.IS,
          label: 'Address',
          subFieldName: 'addressCountry',
        }),
      ).toBe('France, Germany');
    });
  });
});
