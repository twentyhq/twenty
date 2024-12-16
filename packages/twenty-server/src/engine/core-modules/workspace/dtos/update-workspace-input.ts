import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

import { ForbiddenWords } from 'src/engine/utils/custom-class-validator/ForbiddenWords';

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  domainName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/)
  @ForbiddenWords([
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
    'uk',
    'eu',
    'asia',
    'africa',
    'america',
    /api-(.*?)+/,
  ])
  subdomain?: string;

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
}
