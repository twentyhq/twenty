import {
  type GraphQLInputObjectType,
  type GraphQLObjectType,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import {
  emailsCompositeType,
  FieldMetadataType,
  linksCompositeType,
  phonesCompositeType,
} from 'twenty-shared/types';

import { CompositeFieldMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/composite-field-metadata-create-gql-input-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeCompositeFieldObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-object-type-key.util';

describe('composite sub-field gql types', () => {
  let gqlTypesStorage: GqlTypesStorage;
  let objectTypeGenerator: CompositeFieldMetadataGqlObjectTypeGenerator;
  let createInputTypeGenerator: CompositeFieldMetadataCreateGqlInputTypeGenerator;

  beforeEach(() => {
    gqlTypesStorage = new GqlTypesStorage();
    objectTypeGenerator = new CompositeFieldMetadataGqlObjectTypeGenerator(
      gqlTypesStorage,
      new TypeMapperService(),
    );
    createInputTypeGenerator =
      new CompositeFieldMetadataCreateGqlInputTypeGenerator(
        gqlTypesStorage,
        new TypeMapperService(),
      );
  });

  const getObjectType = (fieldMetadataType: FieldMetadataType) => {
    const type = gqlTypesStorage.getGqlTypeByKey(
      computeCompositeFieldObjectTypeKey(fieldMetadataType),
    );

    if (!isObjectType(type)) {
      throw new Error(`Expected an object type for ${fieldMetadataType}`);
    }

    return type as GraphQLObjectType;
  };

  const getCreateInputType = (fieldMetadataType: FieldMetadataType) => {
    const type = gqlTypesStorage.getGqlTypeByKey(
      computeCompositeFieldInputTypeKey(
        fieldMetadataType,
        GqlInputTypeDefinitionKind.Create,
      ),
    );

    if (!isInputObjectType(type)) {
      throw new Error(`Expected an input type for ${fieldMetadataType}`);
    }

    return type as GraphQLInputObjectType;
  };

  it('types raw json sub-fields in output types', () => {
    objectTypeGenerator.buildAndStore(emailsCompositeType);
    objectTypeGenerator.buildAndStore(phonesCompositeType);
    objectTypeGenerator.buildAndStore(linksCompositeType);

    expect(
      String(
        getObjectType(FieldMetadataType.EMAILS).getFields().additionalEmails
          .type,
      ),
    ).toBe('[String!]');
    expect(
      String(
        getObjectType(FieldMetadataType.PHONES).getFields().additionalPhones
          .type,
      ),
    ).toBe('[AdditionalPhone!]');
    expect(
      String(
        getObjectType(FieldMetadataType.LINKS).getFields().secondaryLinks.type,
      ),
    ).toBe('[SecondaryLink!]');
  });

  it('types raw json sub-fields in create input types', () => {
    createInputTypeGenerator.buildAndStore(phonesCompositeType);

    expect(
      String(
        getCreateInputType(FieldMetadataType.PHONES).getFields()
          .additionalPhones.type,
      ),
    ).toBe('[AdditionalPhoneInput!]');
  });
});
