import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { type FieldActorForInputValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { InMemoryCache } from '@apollo/client';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';
import { mockCurrentWorkspaceMembers } from '~/testing/mock-data/workspace-members';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';

describe('computeOptimisticRecordFromInput', () => {
  const currentWorkspaceMember = mockCurrentWorkspaceMembers[0];
  const currentWorkspaceMemberFullname = `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`;
  it('should generate correct optimistic record if no relation field is present', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      city: 'Paris',
    });
  });

  it('should generate correct optimistic record with actor field', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();
    const actorFieldValueForInput: FieldActorForInputValue = {
      context: {},
      source: 'API',
    };
    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
        createdBy: actorFieldValueForInput,
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      city: 'Paris',
      createdBy: {
        context: {},
        name: currentWorkspaceMemberFullname,
        source: 'API',
        workspaceMemberId: currentWorkspaceMember.id,
      },
    });
  });

  it('should generate correct optimistic record createdBy when recordInput contains id', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();
    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        id: '20202020-058c-4591-a7d7-50a75af6d1e6',
        createdBy: {
          source: 'SYSTEM',
          context: {},
        } satisfies FieldActorForInputValue,
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      id: '20202020-058c-4591-a7d7-50a75af6d1e6',
      createdBy: {
        context: {},
        name: currentWorkspaceMemberFullname,
        source: 'SYSTEM',
        workspaceMemberId: currentWorkspaceMember.id,
      },
    });
  });

  it('should generate correct optimistic record if relation field is present but cache is empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      companyId: '123',
    });
  });

  it('should generate correct optimistic record even if recordInput contains field __typename', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();
    const companyObjectMetadataItem = getMockCompanyObjectMetadataItem();

    const companyRecord = {
      id: '123',
      __typename: 'Company',
    };

    const objectMetadataItem: ObjectMetadataItem = {
      ...companyObjectMetadataItem,
      fields: companyObjectMetadataItem.fields.filter(
        (field) => field.name === 'id',
      ),
    };
    const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItem,
      objectMetadataItems: generatedMockObjectMetadataItems,
      record: companyRecord,
      depth: 1,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId: {},
    });

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
        __typename: 'test',
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toStrictEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is present and cache is not empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();
    const companyObjectMetadataItem = getMockCompanyObjectMetadataItem();

    const companyRecord = {
      id: '123',
      __typename: 'Company',
    };

    const objectMetadataItem: ObjectMetadataItem = {
      ...companyObjectMetadataItem,
      fields: [
        getMockFieldMetadataItemOrThrow({
          objectMetadataItem: companyObjectMetadataItem,
          fieldName: 'id',
        }),
      ],
    };
    const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
      depth: 1,
      objectMetadataItem,
      record: companyRecord,
      objectMetadataItems: generatedMockObjectMetadataItems,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
      objectPermissionsByObjectMetadataId: {},
    });

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is null and cache is empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: null,
      },
      cache,
      objectPermissionsByObjectMetadataId: {},
    });

    expect(result).toEqual({
      companyId: null,
      company: null,
    });
  });

  it('should throw an error if recordInput contains fields unrelated to the current objectMetadata', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        currentWorkspaceMember,
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          unknwon: 'unknown',
          foo: 'foo',
          bar: 'bar',
          city: 'Paris',
        },
        cache,
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never occur, encountered unknown fields unknwon, foo, bar in objectMetadataItem person"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        currentWorkspaceMember,
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          companyId: '123',
          company: {},
        },
        cache,
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField even if null', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getMockPersonObjectMetadataItem();

    expect(() =>
      computeOptimisticRecordFromInput({
        currentWorkspaceMember,
        objectMetadataItems: generatedMockObjectMetadataItems,
        objectMetadataItem: personObjectMetadataItem,
        recordInput: {
          companyId: '123',
          company: null,
        },
        cache,
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });
});
