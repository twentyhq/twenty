import { buildResolverNameMap } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { computeGraphQLResolverNameMap } from 'src/engine/api/graphql/direct-execution/utils/compute-graphql-resolver-name-map.util';

const companyObjectMetadata = {
  universalIdentifier: 'company-universal-identifier',
  nameSingular: 'company',
  namePlural: 'companies',
};

const personObjectMetadata = {
  universalIdentifier: 'person-universal-identifier',
  nameSingular: 'person',
  namePlural: 'people',
};

describe('computeGraphQLResolverNameMap', () => {
  it('maps query and mutation resolver names to their object', () => {
    const resolverNameMap = computeGraphQLResolverNameMap({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [companyObjectMetadata.universalIdentifier]: companyObjectMetadata,
        },
      },
    });

    expect(resolverNameMap.companies).toEqual({
      objectMetadataUniversalIdentifier: 'company-universal-identifier',
      method: 'findMany',
      operationType: 'query',
    });
    expect(resolverNameMap.createCompany).toEqual({
      objectMetadataUniversalIdentifier: 'company-universal-identifier',
      method: 'createOne',
      operationType: 'mutation',
    });
  });

  it('matches the resolver name map built from object metadata rows', () => {
    expect(
      computeGraphQLResolverNameMap({
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [companyObjectMetadata.universalIdentifier]: companyObjectMetadata,
            [personObjectMetadata.universalIdentifier]: personObjectMetadata,
            'missing-universal-identifier': undefined,
          },
        },
      }),
    ).toEqual(
      buildResolverNameMap([companyObjectMetadata, personObjectMetadata]),
    );
  });
});
