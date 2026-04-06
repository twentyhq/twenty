import { Module } from '@nestjs/common';

import { AddGlobalKeyValuePairUniqueIndex1774700000000 } from 'src/database/typeorm/core/migrations/common/1774700000000-add-global-key-value-pair-unique-index';
import { AddIsActiveToOverridableEntities1774966727625 } from 'src/database/typeorm/core/migrations/common/1774966727625-addIsActiveToOverridableEntities';
import { AddStatusToAgentMessage1775001600000 } from 'src/database/typeorm/core/migrations/common/1775001600000-add-status-to-agent-message';
import { AddViewFieldGroupIdIndexOnViewField1775129420309 } from 'src/database/typeorm/core/migrations/common/1775129420309-add-view-field-group-id-index-on-view-field';

@Module({
  providers: [
    AddGlobalKeyValuePairUniqueIndex1774700000000,
    AddIsActiveToOverridableEntities1774966727625,
    AddStatusToAgentMessage1775001600000,
    AddViewFieldGroupIdIndexOnViewField1775129420309,
  ],
})
export class InstanceMigrationProvidersModule {}
