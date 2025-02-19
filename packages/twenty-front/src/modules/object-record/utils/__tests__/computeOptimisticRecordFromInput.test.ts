import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { FieldActorForInputValue } from '@/object-record/record-field/types/FieldMetadata';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { InMemoryCache } from '@apollo/client';
import { getCompanyObjectMetadataItem } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPersonObjectMetadataItem } from '~/testing/mock-data/people';
import { mockCurrentWorkspaceMembers } from '~/testing/mock-data/workspace-members';

describe('computeOptimisticRecordFromInput', () => {
  const currentWorkspaceMember = mockCurrentWorkspaceMembers[0];
  const currentWorkspaceMemberFullname = `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`;
  it('should generate correct optimistic record if no relation field is present', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
      },
      cache,
    });

    expect(result).toEqual({
      city: 'Paris',
    });
  });

  it('should generate correct optimistic record with actor field', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();
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
    const personObjectMetadataItem = getPersonObjectMetadataItem();
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
    const personObjectMetadataItem = getPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
    });

    expect(result).toEqual({
      companyId: '123',
    });
  });

  it('should generate correct optimistic record even if recordInput contains field __typename', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();
    const companyObjectMetadataItem = getCompanyObjectMetadataItem();

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
    const recordGqlFields = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: companyRecord,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
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
    });

    expect(result).toStrictEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is present and cache is not empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();
    const companyObjectMetadataItem = getCompanyObjectMetadataItem();

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
    const recordGqlFields = generateDepthOneRecordGqlFields({
      objectMetadataItem,
      record: companyRecord,
    });
    updateRecordFromCache({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem,
      cache,
      record: companyRecord,
      recordGqlFields,
    });

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '123',
      },
      cache,
    });

    expect(result).toEqual({
      companyId: '123',
      company: companyRecord,
    });
  });

  it('should generate correct optimistic record if relation field is null and cache is empty', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();

    const result = computeOptimisticRecordFromInput({
      currentWorkspaceMember,
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: null,
      },
      cache,
    });

    expect(result).toEqual({
      companyId: null,
      company: null,
    });
  });

  it('should throw an error if recordInput contains fields unrelated to the current objectMetadata', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();

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
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never occur, encountered unknown fields unknwon, foo, bar in objectMetadataItem person"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();

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
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });

  it('should throw an error if recordInput contains both the relationFieldId and relationField even if null', () => {
    const cache = new InMemoryCache();
    const personObjectMetadataItem = getPersonObjectMetadataItem();

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
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Should never provide relation mutation through anything else than the fieldId e.g companyId and not company, encountered: company"`,
    );
  });
});
