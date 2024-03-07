import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { RelationMetadataType } from '~/generated/graphql';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const formatGQLString = (inputString: string) =>
  inputString.replace(/^\s*[\r\n]/gm, '');

const getOneToManyRelation = () => {
  const objectMetadataItem = mockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  )!;

  return {
    field: objectMetadataItem.fields.find((field) => field.name === 'company')!,
    res: `company
        {
          __typename
          id
      xLink
      {
        label
        url
      }
      linkedinLink
      {
        label
        url
      }
domainName
      annualRecurringRevenue
      {
        amountMicros
        currencyCode
      }
createdAt
address
updatedAt
name
accountOwnerId
employees
id
idealCustomerProfile
        }`,
  };
};

const getOneToOneRelationField = () => {
  const objectMetadataItem = mockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  )!;

  const oneToManyfield = objectMetadataItem.fields.find(
    (field) => field.name === 'company',
  )!;

  const field: FieldMetadataItem = {
    ...oneToManyfield,
    toRelationMetadata: {
      ...oneToManyfield.toRelationMetadata!,
      relationType: RelationMetadataType.OneToOne,
    },
  };

  return field;
};

const getOneToManyFromRelationField = () => {
  const objectMetadataItem = mockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  )!;

  const field = objectMetadataItem.fields.find(
    (field) => field.name === 'opportunities',
  )!;

  return {
    field,
    res: `opportunities
        {
          edges {
            node {
              __typename
              id
              personId
pointOfContactId
updatedAt
companyId
pipelineStepId
probability
closeDate
      amount
      {
        amountMicros
        currencyCode
      }
id
createdAt
            }
          }
        }`,
  };
};

const getFullNameRelation = () => {
  const objectMetadataItem = mockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  )!;

  const field = objectMetadataItem.fields.find(
    (field) => field.name === 'name',
  )!;

  return {
    field,
    res: `\n      name\n      {\n        firstName\n        lastName\n      }\n    `,
  };
};

describe('useMapFieldMetadataToGraphQLQuery', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return {
          mapFieldMetadataToGraphQLQuery: useMapFieldMetadataToGraphQLQuery(),
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    const oneToManyRelation = getOneToManyRelation();

    const { mapFieldMetadataToGraphQLQuery } = result.current;

    const oneToManyRelationFieldRes = mapFieldMetadataToGraphQLQuery({
      field: oneToManyRelation.field,
    });

    expect(formatGQLString(oneToManyRelationFieldRes)).toEqual(
      oneToManyRelation.res,
    );

    const oneToOneRelation = getOneToOneRelationField();

    const oneToOneRelationFieldRes = mapFieldMetadataToGraphQLQuery({
      field: oneToOneRelation,
    });

    expect(formatGQLString(oneToOneRelationFieldRes)).toEqual(
      oneToManyRelation.res,
    );

    const oneToManyFromRelation = getOneToManyFromRelationField();
    const oneToManyFromRelationFieldRes = mapFieldMetadataToGraphQLQuery({
      field: oneToManyFromRelation.field,
    });

    expect(formatGQLString(oneToManyFromRelationFieldRes)).toEqual(
      oneToManyFromRelation.res,
    );

    const fullNameRelation = getFullNameRelation();
    const fullNameFieldRes = mapFieldMetadataToGraphQLQuery({
      field: fullNameRelation.field,
    });

    expect(fullNameFieldRes).toEqual(fullNameRelation.res);
  });
});
