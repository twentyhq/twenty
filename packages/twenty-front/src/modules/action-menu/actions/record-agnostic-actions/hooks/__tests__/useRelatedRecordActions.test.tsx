import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { useRelatedRecordActions } from '@/action-menu/actions/record-agnostic-actions/hooks/useRelatedRecordActions';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      {
        id: 'person-id',
        nameSingular: CoreObjectNameSingular.Person,
        namePlural: 'People',
        labelSingular: 'Person',
      },
      {
        id: 'company-id',
        nameSingular: CoreObjectNameSingular.Company,
        namePlural: 'Companies',
        labelSingular: 'Company',
      },
    ],
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useRelatedRecordActions', () => {
  const mockGetIcon = jest.fn();

  beforeEach(() => {
    mockGetIcon.mockClear();
  });

  it('should return empty object when objectMetadataItem has no fields', () => {
    const objectMetadataItem = {
      fields: [],
      readableFields: [],
      updatableFields: [],
    } as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({});
  });

  it('should return empty object when objectMetadataItem is undefined', () => {
    const objectMetadataItem = undefined as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({});
  });

  it('should generate actions for one-to-many relations', () => {
    const fields = [
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
        isSystem: false,
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
        isSystem: false,
      },
    ];
    const objectMetadataItem = {
      fields,
      readableFields: fields,
      updatableFields: fields,
    } as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(Object.keys(result.current)).toHaveLength(2);
    expect(result.current['create-related-person']).toBeDefined();
    expect(result.current['create-related-company']).toBeDefined();
  });

  it('should filter out non-one-to-many relations', () => {
    const fields = [
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
        isSystem: false,
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
        isSystem: false,
      },
    ];

    const objectMetadataItem = {
      fields,
      readableFields: fields,
      updatableFields: fields,
    } as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(Object.keys(result.current)).toHaveLength(1);
    expect(result.current['create-related-company']).toBeDefined();
    expect(result.current['create-related-person']).toBeUndefined();
  });

  it('should assign correct positions to each action', () => {
    const fields = [
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
        isSystem: false,
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
        isSystem: false,
      },
    ];
    const objectMetadataItem = {
      fields,
      readableFields: fields,
      updatableFields: fields,
    } as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(result.current['create-related-person'].position).toBe(18);
    expect(result.current['create-related-company'].position).toBe(19);
  });

  it('should filter out system fields', () => {
    const fields = [
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
        isSystem: true,
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
        isSystem: false,
      },
    ];
    const objectMetadataItem = {
      fields,
      readableFields: fields,
      updatableFields: fields,
    } as unknown as ObjectMetadataItem;

    const { result } = renderHook(
      () =>
        useRelatedRecordActions({
          sourceObjectMetadataItem: objectMetadataItem,
          getIcon: mockGetIcon,
          startPosition: 18,
        }),
      { wrapper: Wrapper },
    );

    expect(Object.keys(result.current)).toHaveLength(1);
    expect(result.current['create-related-company']).toBeDefined();
    expect(result.current['create-related-person']).toBeUndefined();
  });
});
