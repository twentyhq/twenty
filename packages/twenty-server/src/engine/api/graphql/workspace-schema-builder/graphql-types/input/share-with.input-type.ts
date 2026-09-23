import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql';

import { RecordShareAccessLevelType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum/record-share-access-level.enum-type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const ShareWithInputType = new GraphQLInputObjectType({
  name: 'ShareWithInput',
  description:
    'Grants access on the created record to exactly one of a workspace member, a role or everyone',
  fields: {
    workspaceMemberId: { type: UUIDScalarType },
    roleId: { type: UUIDScalarType },
    everyone: { type: GraphQLBoolean },
    accessLevel: { type: new GraphQLNonNull(RecordShareAccessLevelType) },
  },
});
