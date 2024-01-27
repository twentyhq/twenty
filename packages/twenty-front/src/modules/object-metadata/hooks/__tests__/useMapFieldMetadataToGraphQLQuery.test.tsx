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
      id
      xLink
      {
        label
        url
      }
accountOwner
    {
      id
    }
      linkedinLink
      {
        label
        url
      }
attachments
      {
        edges {
          node {
            id
          }
        }
      }
domainName
opportunities
      {
        edges {
          node {
            id
          }
        }
      }
      annualRecurringRevenue
      {
        amountMicros
        currencyCode
      }
createdAt
address
updatedAt
activityTargets
      {
        edges {
          node {
            id
          }
        }
      }
favorites
      {
        edges {
          node {
            id
          }
        }
      }
people
      {
        edges {
          node {
            id
          }
        }
      }
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
            id
            personId
pointOfContactId
updatedAt
company
    {
      id
    }
companyId
pipelineStepId
probability
pipelineStep
    {
      id
    }
closeDate
      amount
      {
        amountMicros
        currencyCode
      }
id
createdAt
pointOfContact
    {
      id
    }
person
    {
      id
    }
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

    const oneToManyRelationFieldRes = mapFieldMetadataToGraphQLQuery(
      oneToManyRelation.field,
    );

    expect(formatGQLString(oneToManyRelationFieldRes)).toEqual(
      oneToManyRelation.res,
    );

    const oneToOneRelation = getOneToOneRelationField();

    const oneToOneRelationFieldRes =
      mapFieldMetadataToGraphQLQuery(oneToOneRelation);

    expect(formatGQLString(oneToOneRelationFieldRes)).toEqual(
      oneToManyRelation.res,
    );

    const oneToManyFromRelation = getOneToManyFromRelationField();
    const oneToManyFromRelationFieldRes = mapFieldMetadataToGraphQLQuery(
      oneToManyFromRelation.field,
    );

    expect(formatGQLString(oneToManyFromRelationFieldRes)).toEqual(
      oneToManyFromRelation.res,
    );

    const fullNameRelation = getFullNameRelation();
    const fullNameFieldRes = mapFieldMetadataToGraphQLQuery(
      fullNameRelation.field,
    );

    expect(fullNameFieldRes).toEqual(fullNameRelation.res);
  });
});
