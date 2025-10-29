import { FieldMetadataType } from 'twenty-shared/types';

import { getAllSelectableFields } from 'src/engine/api/rest/core/rest-to-common-args-handlers/utils/get-all-selectable-fields.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

describe('getAllSelectableFields', () => {
  it('should return all fields as selectable when no restrictions', () => {
    const objectMetadata = {
      objectMetadataMapItem: {
        fieldsById: {
          'field-1': {
            id: 'field-1',
            name: 'name',
            type: FieldMetadataType.TEXT,
          },
          'field-2': {
            id: 'field-2',
            name: 'email',
            type: FieldMetadataType.TEXT,
          },
        },
      } as any as ObjectMetadataItemWithFieldMaps,
    };

    const result = getAllSelectableFields({
      restrictedFields: {},
      objectMetadata,
    });

    expect(result).toEqual({
      name: true,
      email: true,
    });
  });

  it('should not return restricted fields', () => {
    const objectMetadata = {
      objectMetadataMapItem: {
        fieldsById: {
          'field-1': {
            id: 'field-1',
            name: 'name',
            type: FieldMetadataType.TEXT,
          },
          'field-2': {
            id: 'field-2',
            name: 'email',
            type: FieldMetadataType.TEXT,
          },
        },
      } as any as ObjectMetadataItemWithFieldMaps,
    };

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
      },
      objectMetadata,
    });

    expect(result).toEqual({
      name: true,
    });
  });

  it('should create nested objects for composite fields', () => {
    const objectMetadata = {
      objectMetadataMapItem: {
        fieldsById: {
          'field-1': {
            id: 'field-1',
            name: 'name',
            type: FieldMetadataType.TEXT,
          },
          'field-2': {
            id: 'field-2',
            name: 'fullName',
            type: FieldMetadataType.FULL_NAME,
          },
          'field-3': {
            id: 'field-3',
            name: 'domainName',
            type: FieldMetadataType.LINKS,
          },
        },
      } as any as ObjectMetadataItemWithFieldMaps,
    };

    const result = getAllSelectableFields({
      restrictedFields: {},
      objectMetadata,
    });

    expect(result).toEqual({
      name: true,
      fullName: {
        firstName: true,
        lastName: true,
      },
      domainName: {
        primaryLinkLabel: true,
        primaryLinkUrl: true,
        secondaryLinks: true,
      },
    });
  });

  it('should restrict all sub-fields when composite field is restricted', () => {
    const objectMetadata = {
      objectMetadataMapItem: {
        fieldsById: {
          'field-1': {
            id: 'field-1',
            name: 'name',
            type: FieldMetadataType.TEXT,
          },
          'field-2': {
            id: 'field-2',
            name: 'fullName',
            type: FieldMetadataType.FULL_NAME,
          },
        },
      } as any as ObjectMetadataItemWithFieldMaps,
    };

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
      },
      objectMetadata,
    });

    expect(result).toEqual({
      name: true,
    });
  });

  it('should handle mixed regular and composite fields with restrictions', () => {
    const objectMetadata = {
      objectMetadataMapItem: {
        fieldsById: {
          'field-1': {
            id: 'field-1',
            name: 'name',
            type: FieldMetadataType.TEXT,
          },
          'field-2': {
            id: 'field-2',
            name: 'email',
            type: FieldMetadataType.TEXT,
          },
          'field-3': {
            id: 'field-3',
            name: 'fullName',
            type: FieldMetadataType.FULL_NAME,
          },
          'field-4': {
            id: 'field-4',
            name: 'address',
            type: FieldMetadataType.ADDRESS,
          },
        },
      } as any as ObjectMetadataItemWithFieldMaps,
    };

    const result = getAllSelectableFields({
      restrictedFields: {
        'field-2': { canRead: false },
        'field-4': { canRead: false },
      },
      objectMetadata,
    });

    expect(result).toEqual({
      name: true,
      fullName: {
        firstName: true,
        lastName: true,
      },
    });
  });
});
