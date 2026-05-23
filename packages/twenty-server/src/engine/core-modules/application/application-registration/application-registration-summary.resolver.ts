import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationLogoService } from 'src/engine/core-modules/application/application-registration/application-registration-logo.service';
import { ApplicationRegistrationSummaryDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-summary.dto';
import { FileOutputDTO } from 'src/engine/core-modules/file/dtos/file-output.dto';

@MetadataResolver(() => ApplicationRegistrationSummaryDTO)
export class ApplicationRegistrationSummaryResolver {
  constructor(
    private readonly applicationRegistrationLogoService: ApplicationRegistrationLogoService,
  ) {}

  @ResolveField(() => FileOutputDTO, { nullable: true })
  async logo(
    @Parent() registration: ApplicationRegistrationEntity,
  ): Promise<FileOutputDTO | null> {
    return this.applicationRegistrationLogoService.resolveLogoFile(
      registration,
    );
  }
}
