import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { resolveApplicationLogoUrl } from 'src/engine/core-modules/application/utils/resolve-application-logo-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@MetadataResolver(() => ApplicationDTO)
export class ApplicationLogoResolver {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  @ResolveField(() => String, { nullable: true })
  logo(
    @Parent() application: ApplicationDTO & { workspaceId?: string },
  ): string | null {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return resolveApplicationLogoUrl({
      logo: application.logo,
      serverUrl,
      workspaceId: application.workspaceId ?? '',
      applicationId: application.id,
    });
  }
}
