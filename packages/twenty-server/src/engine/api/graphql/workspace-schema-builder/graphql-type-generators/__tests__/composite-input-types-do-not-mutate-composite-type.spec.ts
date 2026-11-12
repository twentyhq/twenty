import { actorCompositeType } from 'twenty-shared/types';

import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/composite-field-metadata-filter-gql-input-types.generator';
import { CompositeFieldMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/composite-field-metadata-order-by-gql-input-type.generator';
import { CompositeFieldMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/composite-field-metadata-update-gql-input-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

describe('composite input type generators', () => {
  it.each([
    ['update', CompositeFieldMetadataUpdateGqlInputTypeGenerator],
    ['filter', CompositeFieldMetadataFilterGqlInputTypeGenerator],
    ['order by', CompositeFieldMetadataOrderByGqlInputTypeGenerator],
  ])(
    'leaves the shared composite type untouched when building %s inputs',
    (_inputKind, InputTypeGenerator) => {
      const gqlTypesStorage = new GqlTypesStorage();
      const compositeTypeBeforeBuild = structuredClone(actorCompositeType);

      new CompositeFieldMetadataGqlEnumTypeGenerator(
        gqlTypesStorage,
      ).buildAndStore(actorCompositeType);
      new InputTypeGenerator(
        gqlTypesStorage,
        new TypeMapperService(),
      ).buildAndStore(actorCompositeType);

      expect(actorCompositeType).toEqual(compositeTypeBeforeBuild);
    },
  );
});
