import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import {
  mockedCompanyObjectMetadataItem,
  mockedOpportunityObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { getFieldPreviewValueFromRecord } from '../getFieldPreviewValueFromRecord';

describe('getFieldPreviewValueFromRecord', () => {
  describe('SELECT field', () => {
    it('returns the select option corresponding to the record field value', () => {
      // Given
      const record: ObjectRecord = {
        id: '',
        stage: 'MEETING',
        __typename: 'Opportunity',
      };
      const fieldMetadataItem = mockedOpportunityObjectMetadataItem.fields.find(
        ({ name }) => name === 'stage',
      )!;
      const selectOptions: SettingsObjectFieldSelectFormValues =
        fieldMetadataItem.options ?? [];

      // When
      const result = getFieldPreviewValueFromRecord({
        record,
        fieldMetadataItem,
        selectOptions,
      });

      // Then
      expect(result).toEqual(selectOptions[2].value);
    });

    it('returns undefined if the select option was not found', () => {
      // Given
      const record: ObjectRecord = {
        id: '',
        industry: 'DOES_NOT_EXIST',
        __typename: 'Opportunity',
      };
      const fieldMetadataItem = mockedOpportunityObjectMetadataItem.fields.find(
        ({ name }) => name === 'stage',
      )!;
      const selectOptions: SettingsObjectFieldSelectFormValues =
        fieldMetadataItem.options ?? [];

      // When
      const result = getFieldPreviewValueFromRecord({
        record,
        fieldMetadataItem,
        selectOptions,
      });

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe('RELATION field', () => {
    it('returns the first relation record from a list of edges ("to many" relation)', () => {
      // Given
      const firstRelationRecord = {
        id: '1',
        name: { firstName: 'Jane', lastName: 'Doe' },
      };
      const record: ObjectRecord = {
        id: '',
        people: {
          edges: [{ node: firstRelationRecord }, { node: { id: '2' } }],
        },
        __typename: 'Opportunity',
      };
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'people',
      )!;

      // When
      const result = getFieldPreviewValueFromRecord({
        record,
        fieldMetadataItem,
      });

      // Then
      expect(result).toEqual(firstRelationRecord);
    });

    it('returns the record field value ("to one" relation)', () => {
      // Given
      const relationRecord = { id: '20', name: 'Twenty' };
      const record = {
        id: '',
        company: relationRecord,
        __typename: 'Opportunity',
      };
      const fieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
        ({ name }) => name === 'company',
      )!;

      // When
      const result = getFieldPreviewValueFromRecord({
        record,
        fieldMetadataItem,
      });

      // Then
      expect(result).toEqual(relationRecord);
    });
  });

  describe('Other fields', () => {
    it('returns the record field value', () => {
      // Given
      const record = { id: '', name: 'Twenty', __typename: 'Opportunity' };
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'name',
      )!;

      // When
      const result = getFieldPreviewValueFromRecord({
        record,
        fieldMetadataItem,
      });

      // Then
      expect(result).toEqual(record.name);
    });
  });
});
