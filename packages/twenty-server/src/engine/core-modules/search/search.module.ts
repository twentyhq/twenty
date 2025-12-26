import { Module } from '@nestjs/common';

import { FileModule } from 'src/engine/core-modules/file/file.module';
import { SearchResolver } from 'src/engine/core-modules/search/search.resolver';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    FileModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    UserRoleModule,
    PermissionsModule,
  ],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
