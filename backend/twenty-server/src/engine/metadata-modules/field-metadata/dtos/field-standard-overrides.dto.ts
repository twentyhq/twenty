import { Field, ObjectType } from '@nestjs/graphql';

import { IsJSON, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { FieldMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-standard-overrides-properties.type';

@ObjectType('StandardOverrides')
export class FieldStandardOverridesDTO
  implements Partial<Record<FieldMetadataStandardOverridesProperties, unknown>>
{
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  label?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsJSON()
  @IsOptional()
  @Field(() => GraphQLJSON, {
    nullable: true,
  })
  translations?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      {
        label?: string | null;
        description?: string | null;
      }
    >
  > | null;
}
