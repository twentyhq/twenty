import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { resolveApplicationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-logo-url.util';
import { FileOutputDTO } from 'src/engine/core-modules/file/dtos/file-output.dto';
import { buildFileOutputFromUrl } from 'src/engine/core-modules/file/utils/build-file-output-from-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@MetadataResolver(() => ApplicationDTO)
export class ApplicationLogoResolver {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @ResolveField(() => FileOutputDTO, { nullable: true })
  logo(
    @Parent() application: ApplicationDTO & { workspaceId?: string },
  ): FileOutputDTO | null {
    if (!application.workspaceId) {
      return buildFileOutputFromUrl(application.logo ?? null);
    }

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return buildFileOutputFromUrl(
      resolveApplicationLogoUrl({
        logo: application.logo,
        serverUrl,
        workspaceId: application.workspaceId,
        applicationId: application.id,
      }),
    );
  }
}
