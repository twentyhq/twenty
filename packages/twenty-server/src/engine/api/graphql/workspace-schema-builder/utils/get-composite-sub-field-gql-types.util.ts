import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  type GraphQLInputType,
  type GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActorContextInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/actor-context.input-type';
import { AdditionalPhonesInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/additional-phones.input-type';
import { SecondaryLinksInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/secondary-links.input-type';
import { ActorContextObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/actor-context.object-type';
import { AdditionalPhonesObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/additional-phones.object-type';
import { SecondaryLinksObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/secondary-links.object-type';

const AdditionalEmailsType = new GraphQLList(new GraphQLNonNull(GraphQLString));

type CompositeSubFieldGqlTypes = {
  output: GraphQLOutputType;
  input: GraphQLInputType;
};

// Composite sub-fields stored as RAW_JSON have a known shape, exposed here as
// real GraphQL types instead of the opaque JSON scalar
const COMPOSITE_SUB_FIELD_GQL_TYPES: Partial<
  Record<FieldMetadataType, Record<string, CompositeSubFieldGqlTypes>>
> = {
  [FieldMetadataType.EMAILS]: {
    additionalEmails: {
      output: AdditionalEmailsType,
      input: AdditionalEmailsType,
    },
  },
  [FieldMetadataType.PHONES]: {
    additionalPhones: {
      output: AdditionalPhonesObjectType,
      input: AdditionalPhonesInputType,
    },
  },
  [FieldMetadataType.LINKS]: {
    secondaryLinks: {
      output: SecondaryLinksObjectType,
      input: SecondaryLinksInputType,
    },
  },
  [FieldMetadataType.ACTOR]: {
    context: {
      output: ActorContextObjectType,
      input: ActorContextInputType,
    },
  },
};

export const getCompositeSubFieldGqlTypes = (
  compositeFieldMetadataType: FieldMetadataType,
  propertyName: string,
): CompositeSubFieldGqlTypes | undefined =>
  COMPOSITE_SUB_FIELD_GQL_TYPES[compositeFieldMetadataType]?.[propertyName];
