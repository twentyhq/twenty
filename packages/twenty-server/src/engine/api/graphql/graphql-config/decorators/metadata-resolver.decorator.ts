import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { RESOLVER_SCHEMA_SCOPE_KEY } from 'src/engine/api/graphql/graphql-config/constants/resolver-schema-scope-key.constant';
import { type ResolverSchemaScope } from 'src/engine/api/graphql/graphql-config/types/resolver-schema-scope.type';

export const MetadataResolver = (typeFunc?: () => unknown) =>
  applyDecorators(
    typeFunc ? Resolver(typeFunc) : Resolver(),
    SetMetadata(RESOLVER_SCHEMA_SCOPE_KEY, 'metadata' as ResolverSchemaScope),
  );
