import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

@ObjectType('ApplicationExportApplication')
export class ApplicationExportApplicationDTO {
  @Field(() => String)
  universalIdentifier: string;

  @Field(() => String)
  displayName: string;

  @Field(() => ApplicationRegistrationSourceType)
  sourceType: ApplicationRegistrationSourceType;
}

@ObjectType('ApplicationExportCoverageEntry')
export class ApplicationExportCoverageEntryDTO {
  @Field(() => String)
  metadataName: AllMetadataName;

  @Field(() => String)
  universalIdentifier: string;

  @Field(() => ApplicationExportCoverageStatus)
  status: ApplicationExportCoverageStatus;

  @Field(() => String, { nullable: true })
  reason?: string;
}

@ObjectType('ApplicationExportFile')
export class ApplicationExportFileDTO {
  @Field(() => String)
  folder: string;

  @Field(() => String)
  path: string;

  @Field(() => String)
  content: string;
}

@ObjectType('ApplicationExport')
export class ApplicationExportDTO {
  @Field(() => ApplicationExportApplicationDTO)
  application: ApplicationExportApplicationDTO;

  @Field(() => GraphQLJSON)
  manifest: Manifest;

  @Field(() => [ApplicationExportCoverageEntryDTO])
  coverage: ApplicationExportCoverageEntryDTO[];

  @Field(() => [ApplicationExportFileDTO])
  files: ApplicationExportFileDTO[];
}
