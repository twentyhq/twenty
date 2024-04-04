import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';

import { getFieldDefaultPreviewValue } from '../getFieldDefaultPreviewValue';

describe('getFieldDefaultPreviewValue', () => {
  describe('SELECT field', () => {
    it('returns the default select option', () => {
      // Given
      const objectMetadataItem = mockedCompanyObjectMetadataItem;
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'industry',
      )!;
      const selectOptions: SettingsObjectFieldSelectFormValues = [
        {
          color: 'purple',
          label: '🏭 Industry',
          value: 'INDUSTRY',
        },
        {
          color: 'pink',
          isDefault: true,
          label: '💊 Health',
          value: 'HEALTH',
        },
      ];

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
        selectOptions,
      });

      // Then
      expect(result).toEqual(selectOptions[1].value);
    });

    it('returns the first select option if no default option was found', () => {
      // Given
      const objectMetadataItem = mockedCompanyObjectMetadataItem;
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'industry',
      )!;
      const selectOptions: SettingsObjectFieldSelectFormValues = [
        {
          color: 'purple' as const,
          label: '🏭 Industry',
          value: 'INDUSTRY',
        },
        {
          color: 'pink' as const,
          label: '💊 Health',
          value: 'HEALTH',
        },
      ];

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
        selectOptions,
      });

      // Then
      expect(result).toEqual(selectOptions[0].value);
    });
  });

  describe('RELATION field', () => {
    it('returns a record with a default label identifier (if relation label identifier type !== TEXT)', () => {
      // Given
      const objectMetadataItem = mockedCompanyObjectMetadataItem;
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'people',
      )!;
      const relationObjectMetadataItem = mockedPersonObjectMetadataItem;

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
        relationObjectMetadataItem,
      });

      // Then
      expect(result).toEqual({
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    it('returns a record with the relation object label singular as label identifier (if relation label identifier type === TEXT)', () => {
      // Given
      const objectMetadataItem = mockedPersonObjectMetadataItem;
      const fieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
        ({ name }) => name === 'company',
      )!;
      const relationObjectMetadataItem = mockedCompanyObjectMetadataItem;

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
        relationObjectMetadataItem,
      });

      // Then
      expect(result).toEqual({
        name: 'Company',
      });
    });

    it('returns null if the relation object does not have a label identifier field', () => {
      // Given
      const objectMetadataItem = mockedPersonObjectMetadataItem;
      const fieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
        ({ name }) => name === 'company',
      )!;
      const relationObjectMetadataItem: ObjectMetadataItem = {
        ...mockedCompanyObjectMetadataItem,
        labelIdentifierFieldMetadataId: null,
        fields: mockedCompanyObjectMetadataItem.fields.filter(
          ({ name }) => name !== 'name',
        ),
      };

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
        relationObjectMetadataItem,
      });

      // Then
      expect(result).toBeNull();
    });
  });

  describe('Other fields', () => {
    it('returns the object singular name as default value for the label identifier field (type TEXT)', () => {
      // Given
      const objectMetadataItem = mockedCompanyObjectMetadataItem;
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'name',
      )!;

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
      });

      // Then
      expect(result).toBe('Company');
    });

    it('returns a default value for the label identifier field (type FULL_NAME)', () => {
      // Given
      const objectMetadataItem = mockedPersonObjectMetadataItem;
      const fieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
        ({ name }) => name === 'name',
      )!;

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
      });

      // Then
      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('returns a default value for other field types', () => {
      // Given
      const objectMetadataItem = mockedCompanyObjectMetadataItem;
      const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
        ({ name }) => name === 'domainName',
      )!;

      // When
      const result = getFieldDefaultPreviewValue({
        objectMetadataItem,
        fieldMetadataItem,
      });

      // Then
      expect(result).toBe(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
      );
    });
  });
});
