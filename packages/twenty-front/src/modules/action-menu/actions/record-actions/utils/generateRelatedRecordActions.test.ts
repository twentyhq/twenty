import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateRelatedRecordActions } from './generateRelatedRecordActions';

describe('generateRelatedRecordActions', () => {
  const mockGetTargetObjectReadPermission = jest.fn();
  const mockGetIcon = jest.fn();

  beforeEach(() => {
    mockGetTargetObjectReadPermission.mockClear();
    mockGetIcon.mockClear();
  });

  it('should return empty object when objectMetadataItem has no fields', () => {
    const objectMetadataItem = {
      fields: [],
    } as unknown as ObjectMetadataItem;

    const result = generateRelatedRecordActions({
      sourceObjectMetadataItem: objectMetadataItem,
      getIcon: mockGetIcon,
      position: 18,
    });

    expect(result).toEqual({});
  });

  it('should return empty object when objectMetadataItem is undefined', () => {
    const objectMetadataItem = undefined as unknown as ObjectMetadataItem;

    const result = generateRelatedRecordActions({
      sourceObjectMetadataItem: objectMetadataItem,
      getIcon: mockGetIcon,
      position: 18,
    });

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
          label: 'person',
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
          label: 'company',
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions({
      sourceObjectMetadataItem: objectMetadataItem,
      getIcon: mockGetIcon,
      position: 18,
    });

    expect(Object.keys(result)).toHaveLength(2);
    expect(result['create-related-person']).toBeDefined();
    expect(result['create-related-company']).toBeDefined();
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
          label: 'person',
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
          label: 'company',
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions({
      sourceObjectMetadataItem: objectMetadataItem,
      getIcon: mockGetIcon,
      position: 18,
    });

    expect(Object.keys(result)).toHaveLength(1);
    expect(result['create-related-company']).toBeDefined();
    expect(result['create-related-person']).toBeUndefined();
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
          label: 'person',
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
          label: 'company',
        },
      ],
    } as unknown as ObjectMetadataItem;

    mockGetTargetObjectReadPermission.mockReturnValue(true);

    const result = generateRelatedRecordActions({
      sourceObjectMetadataItem: objectMetadataItem,
      getIcon: mockGetIcon,
      position: 18,
    });

    expect(result['create-related-person'].position).toBe(18);
    expect(result['create-related-company'].position).toBe(19);
  });
});
