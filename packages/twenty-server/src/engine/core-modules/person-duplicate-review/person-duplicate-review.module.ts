import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonDuplicatePairDecisionEntity } from 'src/engine/core-modules/person-duplicate-review/entities/person-duplicate-pair-decision.entity';
import { PersonRecordMergeEntity } from 'src/engine/core-modules/person-duplicate-review/entities/person-record-merge.entity';
import { PersonDuplicateReviewResolver } from 'src/engine/core-modules/person-duplicate-review/person-duplicate-review.resolver';
import { PersonDuplicateReviewService } from 'src/engine/core-modules/person-duplicate-review/person-duplicate-review.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonDuplicatePairDecisionEntity,
      PersonRecordMergeEntity,
    ]),
  ],
  providers: [
    PersonDuplicateReviewResolver,
    PersonDuplicateReviewService,
    provideWorkspaceScopedRepository(PersonDuplicatePairDecisionEntity),
  ],
})
export class PersonDuplicateReviewModule {}
