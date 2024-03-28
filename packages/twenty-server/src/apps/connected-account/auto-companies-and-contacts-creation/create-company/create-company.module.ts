import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CompanyObjectMetadata } from 'src/apps/company/standard-objects/company.object-metadata';
import { CreateCompanyService } from 'src/apps/connected-account/auto-companies-and-contacts-creation/create-company/create-company.service';

@Module({
  imports: [ObjectMetadataRepositoryModule.forFeature([CompanyObjectMetadata])],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CreateCompanyModule {}
