import { Module } from '@nestjs/common';

import { FileModule } from 'src/engine/core-modules/file/file.module';
import { SearchResolver } from 'src/engine/core-modules/search/search.resolver';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [FileModule, ObjectMetadataModule],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
