import { Module } from '@nestjs/common';

import { WorkspaceSchemaColumnManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-column-manager.service';
import { WorkspaceSchemaEnumManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-enum-manager.service';
import { WorkspaceSchemaForeignKeyManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-foreign-key-manager.service';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';

import { WorkspaceSchemaManagerService } from './workspace-schema-manager.service';

@Module({
  providers: [
    WorkspaceSchemaManagerService,
    WorkspaceSchemaTableManagerService,
    WorkspaceSchemaColumnManagerService,
    WorkspaceSchemaIndexManagerService,
    WorkspaceSchemaEnumManagerService,
    WorkspaceSchemaForeignKeyManagerService,
  ],
  exports: [WorkspaceSchemaManagerService],
})
export class WorkspaceSchemaManagerModule {}
