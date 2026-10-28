import { UseGuards } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  Field,
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { isEnumType } from 'graphql';
import { PermissionFlagType } from 'twenty-shared/constants';

import { PERMISSION_FLAG_TYPE_WITH_LEGACY_KEYS } from 'src/engine/core-modules/user-workspace/enums/permission-flag-type-with-legacy-keys.enum';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@ObjectType('PermissionFlagTypeSchemaTest')
class PermissionFlagTypeSchemaTestDTO {
  @Field(() => [PERMISSION_FLAG_TYPE_WITH_LEGACY_KEYS])
  permissionFlags: string[];
}

@Resolver()
class PermissionFlagTypeSchemaTestResolver {
  @Query(() => PermissionFlagTypeSchemaTestDTO)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  permissionFlagTypeSchemaTest(): PermissionFlagTypeSchemaTestDTO {
    throw new Error('Only used to build the schema');
  }
}

it('serves the previous permission flag keys as deprecated values of PermissionFlagType', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );

  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([PermissionFlagTypeSchemaTestResolver]);
    const permissionFlagType = schema.getType('PermissionFlagType');

    if (!isEnumType(permissionFlagType)) {
      throw new Error('PermissionFlagType is missing from the schema');
    }

    expect(
      Object.fromEntries(
        permissionFlagType
          .getValues()
          .map(({ name, value, deprecationReason }) => [
            name,
            { value, deprecationReason },
          ]),
      ),
    ).toEqual({
      ...Object.fromEntries(
        Object.values(PermissionFlagType).map((permissionFlag) => [
          permissionFlag,
          { value: permissionFlag, deprecationReason: undefined },
        ]),
      ),
      CONNECTED_ACCOUNTS: {
        value: 'CONNECTED_ACCOUNTS',
        deprecationReason: 'Use USER_APPS instead.',
      },
      APPLICATIONS: {
        value: 'APPLICATIONS',
        deprecationReason: 'Use WORKSPACE_APPS instead.',
      },
    });
  } finally {
    await application.close();
  }
});
