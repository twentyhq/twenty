import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^(?!api-).*^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/)
  @IsNotIn([
    'demo',
    'api',
    't',
    'companies',
    'telemetry',
    'logs',
    'metrics',
    'next',
    'main',
    'admin',
    'dashboard',
    'dash',
    'billing',
    'db',
    'favicon',
    'www',
    'mail',
    'docs',
    'dev',
    'app',
    'staging',
    'production',
    'developer',
    'files',
    'cdn',
    'storage',
    'about',
    'help',
    'support',
    'contact',
    'privacy',
    'terms',
    'careers',
    'jobs',
    'blog',
    'news',
    'events',
    'community',
    'forum',
    'chat',
    'test',
    'testing',
    'feedback',
    'config',
    'settings',
    'media',
    'image',
    'audio',
    'video',
    'images',
    'partners',
    'partnership',
    'partnerships',
    'assets',
    'login',
    'signin',
    'signup',
    'legal',
    'shop',
    'merch',
    'store',
    'auth',
    'register',
    'payment',
    'fr',
    'de',
    'it',
    'es',
    'pt',
    'nl',
    'be',
    'ch',
    'us',
    'ca',
    'au',
    'nz',
    'za',
    'eu',
    'uk',
    'ru',
    'ua',
    'pl',
    'ro',
    'bg',
    'gr',
    'cz',
    'sk',
    'hu',
    'hr',
    'si',
    'rs',
    'me',
    'ba',
    'mk',
    'al',
    'az',
    'tr',
    'cy',
    'lv',
    'lt',
    'ee',
    'fi',
    'is',
    'no',
    'se',
    'dk',
    'asia',
    'africa',
    'america',
    'europe',
    'north-america',
    'south-africa',
    'north-africa',
    'south-america',
    'oceania',
    'paris',
    'london',
    'new-york',
    'san-francisco',
  ])
  subdomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
  )
  customDomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  inviteHash?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublicInviteLinkEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowImpersonation?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isGoogleAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isMicrosoftAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPasswordAuthEnabled?: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  defaultRoleId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isTwoFactorAuthenticationEnforced?: boolean;
}
