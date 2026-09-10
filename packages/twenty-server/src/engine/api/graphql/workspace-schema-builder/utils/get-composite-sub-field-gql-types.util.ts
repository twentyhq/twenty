import {
  getNamedType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  isObjectType,
  type GraphQLInputType,
  type GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { ActorContextInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/actor-context.input-type';
import { AdditionalPhonesInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/additional-phones.input-type';
import { SecondaryLinksInputType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input/secondary-links.input-type';
import { ActorContextObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/actor-context.object-type';
import { AdditionalPhonesObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/additional-phones.object-type';
import { SecondaryLinksObjectType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object/secondary-links.object-type';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

type CompositeSubFieldGqlTypes = {
  output: GraphQLOutputType;
  input: GraphQLInputType;
};

const AdditionalEmailsType = new GraphQLList(new GraphQLNonNull(GraphQLString));

const EMAILS_SUB_FIELD_GQL_TYPES = {
  additionalEmails: {
    output: AdditionalEmailsType,
    input: AdditionalEmailsType,
  },
};

const PHONES_SUB_FIELD_GQL_TYPES = {
  additionalPhones: {
    output: AdditionalPhonesObjectType,
    input: AdditionalPhonesInputType,
  },
};

const LINKS_SUB_FIELD_GQL_TYPES = {
  secondaryLinks: {
    output: SecondaryLinksObjectType,
    input: SecondaryLinksInputType,
  },
};

const ACTOR_SUB_FIELD_GQL_TYPES = {
  context: {
    output: ActorContextObjectType,
    input: ActorContextInputType,
  },
};

const NO_SUB_FIELD_GQL_TYPES = {};

// Composite sub-fields stored as RAW_JSON have a known shape, exposed here as
// real GraphQL types instead of the opaque JSON scalar
const getCompositeSubFieldGqlTypesByPropertyName = (
  compositeFieldMetadataType: CompositeFieldMetadataType,
): Record<string, CompositeSubFieldGqlTypes> => {
  switch (compositeFieldMetadataType) {
    case FieldMetadataType.EMAILS:
      return EMAILS_SUB_FIELD_GQL_TYPES;
    case FieldMetadataType.PHONES:
      return PHONES_SUB_FIELD_GQL_TYPES;
    case FieldMetadataType.LINKS:
      return LINKS_SUB_FIELD_GQL_TYPES;
    case FieldMetadataType.ACTOR:
      return ACTOR_SUB_FIELD_GQL_TYPES;
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.RICH_TEXT:
      return NO_SUB_FIELD_GQL_TYPES;
    default:
      return assertUnreachable(compositeFieldMetadataType);
  }
};

export const getCompositeSubFieldGqlTypes = (
  fieldMetadataType: FieldMetadataType,
  propertyName: string,
): CompositeSubFieldGqlTypes | undefined =>
  isCompositeFieldMetadataType(fieldMetadataType)
    ? getCompositeSubFieldGqlTypesByPropertyName(fieldMetadataType)[
        propertyName
      ]
    : undefined;

export const getCompositeSubFieldObjectTypeName = (
  fieldMetadataType: FieldMetadataType,
  propertyName: string,
): string | undefined => {
  const outputType = getCompositeSubFieldGqlTypes(
    fieldMetadataType,
    propertyName,
  )?.output;

  if (!isDefined(outputType)) {
    return undefined;
  }

  const namedType = getNamedType(outputType);

  return isObjectType(namedType) ? namedType.name : undefined;
};
