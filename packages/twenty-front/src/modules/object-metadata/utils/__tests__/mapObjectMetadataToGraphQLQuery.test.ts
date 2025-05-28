import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { normalizeGQLQuery } from '~/utils/normalizeGQLQuery';

const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

if (!personObjectMetadataItem) {
  throw new Error('ObjectMetadataItem not found');
}

describe('mapObjectMetadataToGraphQLQuery', () => {
  it('should query only specified recordGqlFields', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordGqlFields: {
        company: true,
        xLink: true,
        id: true,
        createdAt: true,
        city: true,
        email: true,
        jobTitle: true,
        name: true,
        phone: true,
        linkedinLink: true,
        updatedAt: true,
        avatarUrl: true,
        companyId: true,
      },
    });
    expect(normalizeGQLQuery(res)).toEqual(
      normalizeGQLQuery(`{
    __typename
    name
    {
      firstName
      lastName
    }
    emails
    {
        primaryEmail
        additionalEmails
    }
    phone 
    {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
    }
    createdAt
    avatarUrl
    jobTitle
    city
    id
    xLink
    {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
    }
    company
    {
    __typename
    idealCustomerProfile
    id
    xLink
    {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
    }
    annualRecurringRevenue
    {
      amountMicros
      currencyCode
    }
    address
    {
      addressStreet1
      addressStreet2
      addressCity
      addressState
      addressCountry
      addressPostcode
      addressLat
      addressLng
    }
    employees
    position
    name
    linkedinLink
    {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
    }
    createdAt
    accountOwnerId
    domainName
    {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
    }
    updatedAt
    }
    updatedAt
    companyId
    linkedinLink
    {
      primaryLinkUrl
      primaryLinkLabel
      secondaryLinks
    }
    }`),
    );
  });

  it('should load only specified operation fields nested', async () => {
    const res = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordGqlFields: { company: { id: true }, id: true, name: true },
    });
    expect(normalizeGQLQuery(res)).toEqual(
      normalizeGQLQuery(`{
__typename
id
company
{
__typename
id
}
name
{
  firstName
  lastName
}
}`),
    );
  });

  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    fields: [
      {
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
        isActive: true,
      },
    ],
  } as ObjectMetadataItem;

  const mockObjectMetadataItems: ObjectMetadataItem[] = [
    mockObjectMetadataItem,
  ];

  it('should return GraphQL query even when root object has no read permission', () => {
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {
      'test-object-id': {
        objectMetadataId: 'test-object-id',
        canReadObjectRecords: false,
      } as ObjectPermission,
    };

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: mockObjectMetadataItem,
      objectPermissionsByObjectMetadataId,
      isRootLevel: true, // Root level objects are never filtered out
    });

    // Root level objects should always return a valid query, even without permission
    expect(result).toContain('__typename');
    expect(result).toContain('name');
    expect(result).not.toBe('');
  });

  it('should return empty string when non-root object has no read permission', () => {
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {
      'test-object-id': {
        objectMetadataId: 'test-object-id',
        canReadObjectRecords: false,
      } as ObjectPermission,
    };

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: mockObjectMetadataItem,
      objectPermissionsByObjectMetadataId,
      isRootLevel: false, // Non-root level objects can be filtered out
    });

    expect(result).toBe('');
  });

  it('should return GraphQL query when object has read permission', () => {
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {
      'test-object-id': {
        objectMetadataId: 'test-object-id',
        canReadObjectRecords: true,
      } as ObjectPermission,
    };

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: mockObjectMetadataItem,
      objectPermissionsByObjectMetadataId,
    });

    expect(result).toContain('__typename');
    expect(result).toContain('name');
  });

  it('should return GraphQL query when no permissions are provided', () => {
    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toContain('__typename');
    expect(result).toContain('name');
  });

  it('should return GraphQL query when permission is undefined', () => {
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {
      'test-object-id': {
        objectMetadataId: 'test-object-id',
        canReadObjectRecords: undefined,
      } as ObjectPermission,
    };

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectMetadataItems,
      objectMetadataItem: mockObjectMetadataItem,
      objectPermissionsByObjectMetadataId,
    });

    expect(result).toContain('__typename');
    expect(result).toContain('name');
  });

  it('should return valid GraphQL when object has permission but relations do not', () => {
    // Create a mock object with relations
    const mockObjectWithRelations: ObjectMetadataItem = {
      id: 'view-object-id',
      nameSingular: 'view',
      namePlural: 'views',
      fields: [
        {
          id: 'field-1',
          name: 'id',
          type: FieldMetadataType.UUID,
          isActive: true,
        },
        {
          id: 'field-2',
          name: 'name',
          type: FieldMetadataType.TEXT,
          isActive: true,
        },
        {
          id: 'field-3',
          name: 'person',
          type: FieldMetadataType.RELATION,
          isActive: true,
          relationDefinition: {
            direction: 'MANY_TO_ONE',
            targetObjectMetadata: { id: 'person-object-id' },
          },
        },
        {
          id: 'field-4',
          name: 'company',
          type: FieldMetadataType.RELATION,
          isActive: true,
          relationDefinition: {
            direction: 'MANY_TO_ONE',
            targetObjectMetadata: { id: 'company-object-id' },
          },
        },
      ],
    } as ObjectMetadataItem;

    const mockPersonObject: ObjectMetadataItem = {
      id: 'person-object-id',
      nameSingular: 'person',
      namePlural: 'people',
      fields: [
        {
          id: 'person-field-1',
          name: 'id',
          type: FieldMetadataType.UUID,
          isActive: true,
        },
        {
          id: 'person-field-2',
          name: 'name',
          type: FieldMetadataType.TEXT,
          isActive: true,
        },
      ],
    } as ObjectMetadataItem;

    const mockCompanyObject: ObjectMetadataItem = {
      id: 'company-object-id',
      nameSingular: 'company',
      namePlural: 'companies',
      fields: [
        {
          id: 'company-field-1',
          name: 'id',
          type: FieldMetadataType.UUID,
          isActive: true,
        },
      ],
    } as ObjectMetadataItem;

    const mockObjectsWithRelations = [
      mockObjectWithRelations,
      mockPersonObject,
      mockCompanyObject,
    ];

    // View has permission, person has permission, company does NOT have permission
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {
      'view-object-id': {
        objectMetadataId: 'view-object-id',
        canReadObjectRecords: true,
      } as ObjectPermission,
      'person-object-id': {
        objectMetadataId: 'person-object-id',
        canReadObjectRecords: true,
      } as ObjectPermission,
      'company-object-id': {
        objectMetadataId: 'company-object-id',
        canReadObjectRecords: false, // No permission for company
      } as ObjectPermission,
    };

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: mockObjectsWithRelations,
      objectMetadataItem: mockObjectWithRelations,
      objectPermissionsByObjectMetadataId,
    });

    // Should contain basic fields
    expect(result).toContain('__typename');
    expect(result).toContain('id');
    expect(result).toContain('name');

    // Should contain person relation (has permission)
    expect(result).toContain('person');

    // Should NOT contain company relation (no permission)
    expect(result).not.toContain('company');

    // Should be valid GraphQL (no empty node)
    expect(result).not.toContain('node\n');
    expect(result).not.toContain('node }');
  });

  it('should handle View object scenario with mixed permissions', () => {
    // Simulate the exact scenario: View has permission, Person has permission, but other objects don't
    const viewObjectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'view',
    );

    if (!viewObjectMetadataItem) {
      throw new Error('View ObjectMetadataItem not found');
    }

    // Only View and Person have read permission, all others are false
    const objectPermissionsByObjectMetadataId: Record<
      string,
      ObjectPermission
    > = {};

    // Set all objects to no permission by default
    generatedMockObjectMetadataItems.forEach((item) => {
      objectPermissionsByObjectMetadataId[item.id] = {
        objectMetadataId: item.id,
        canReadObjectRecords: false,
      } as ObjectPermission;
    });

    // Only allow View and Person
    const viewId = viewObjectMetadataItem.id;
    const personId = personObjectMetadataItem?.id;

    if (isDefined(viewId)) {
      objectPermissionsByObjectMetadataId[viewId] = {
        objectMetadataId: viewId,
        canReadObjectRecords: true,
      } as ObjectPermission;
    }

    if (isDefined(personId)) {
      objectPermissionsByObjectMetadataId[personId] = {
        objectMetadataId: personId,
        canReadObjectRecords: true,
      } as ObjectPermission;
    }

    const result = mapObjectMetadataToGraphQLQuery({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: viewObjectMetadataItem,
      objectPermissionsByObjectMetadataId,
    });

    // Should be valid GraphQL with at least basic fields
    expect(result).toContain('__typename');
    expect(result).toContain('id'); // Should have id field
    expect(result.trim()).not.toBe('{\n__typename\n}'); // Should have more than just __typename

    // Should not be empty or malformed
    expect(result).not.toBe('');
    expect(result).toMatch(/\{[\s\S]*\}/); // Should be a valid GraphQL object structure

    console.log('Generated View query:', result);
  });
});
