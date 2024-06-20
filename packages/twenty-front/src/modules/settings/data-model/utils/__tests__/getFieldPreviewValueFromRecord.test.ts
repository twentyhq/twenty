import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { getFieldPreviewValueFromRecord } from '../getFieldPreviewValueFromRecord';

describe('getFieldPreviewValueFromRecord', () => {
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
