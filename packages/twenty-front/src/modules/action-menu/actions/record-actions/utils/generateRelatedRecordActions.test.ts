import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateRelatedRecordActions } from './generateRelatedRecordActions';

describe('generateRelatedRecordActions', () => {
  const mockGetTargetObjectReadPermission = jest.fn();

  beforeEach(() => {
    mockGetTargetObjectReadPermission.mockClear();
  });

  it('should return empty object when objectMetadataItem has no fields', () => {
    const objectMetadataItem = {
      fields: [],
    } as unknown as ObjectMetadataItem;

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(result).toEqual({});
  });

  it('should return empty object when objectMetadataItem is undefined', () => {
    const objectMetadataItem = undefined as unknown as ObjectMetadataItem;

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(result).toEqual({});
  });

  it('should generate actions for one-to-many relations', () => {
    const objectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
              namePlural: 'People',
            },
          },
        },
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Company,
              namePlural: 'Companies',
            },
          },
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['create-related-person-single-record']).toBeDefined();
    expect(result['create-related-company-single-record']).toBeDefined();
    expect(mockGetTargetObjectReadPermission).toHaveBeenCalledWith(
      CoreObjectNameSingular.Person,
    );
    expect(mockGetTargetObjectReadPermission).toHaveBeenCalledWith(
      CoreObjectNameSingular.Company,
    );
  });

  it('should not generate actions when user lacks permissions', () => {
    const objectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
              namePlural: 'People',
            },
          },
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(false);

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(result).toEqual({});
    expect(mockGetTargetObjectReadPermission).toHaveBeenCalledWith(
      CoreObjectNameSingular.Person,
    );
  });

  it('should filter out non-one-to-many relations', () => {
    const objectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: 'MANY_TO_ONE',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
              namePlural: 'People',
            },
          },
        },
        {
          type: 'TEXT',
        },
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Company,
              namePlural: 'Companies',
            },
          },
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['create-related-company-single-record']).toBeDefined();
    expect(result['create-related-person-single-record']).toBeUndefined();
  });

  it('should assign correct positions starting from 18', () => {
    const objectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
              namePlural: 'People',
            },
          },
        },
        {
          type: 'RELATION',
          relation: {
            type: 'ONE_TO_MANY',
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Company,
              namePlural: 'Companies',
            },
          },
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions(
      objectMetadataItem,
      // mockGetTargetObjectReadPermission,
    );

    expect(result['create-related-person-single-record'].position).toBe(18);
    expect(result['create-related-company-single-record'].position).toBe(19);
  });
});
