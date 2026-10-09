import { Field, ObjectType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { SettingsMenuItemDTO } from 'src/engine/metadata-modules/settings-menu-item/dtos/settings-menu-item.dto';

@ObjectType('ApplicationPreferences')
export class ApplicationPreferencesDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => [SettingsMenuItemDTO])
  settingsMenuItems: SettingsMenuItemDTO[];

  @Field(() => [UserApplicationVariableValueDTO])
  variables: UserApplicationVariableValueDTO[];
}
