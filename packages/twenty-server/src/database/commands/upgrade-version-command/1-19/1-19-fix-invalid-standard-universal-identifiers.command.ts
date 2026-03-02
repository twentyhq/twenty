import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { STANDARD_AGENT } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { STANDARD_SKILL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-skill.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER =
  '20202020-0001-0001-0001-000000000001';
const OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER =
  '20202020-0002-0001-0001-000000000004';

const STANDARD_OBJECT_MISMATCHES = [
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'c9e5a0b4-1d36-4f8c-0a7b-3e4f5d6c7a81',
    newValue: '9d31ea73-13b6-4e06-84ee-c66c72bf7787',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'd0f6b1c5-2e47-4a9d-1b8c-4f5a6e7d8b92',
    newValue: '55637a5a-1edc-4351-8d76-d40020bf8944',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'e1a7c2d6-3f58-4b0e-2c9d-5a6b7f8e9c03',
    newValue: '4137ba06-184d-438f-b484-080f02a97659',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'f2b8d3e7-4a69-4c1f-3d0e-6b7c8a9f0d14',
    newValue: '8cc162d1-c127-4981-878d-f78622f8f12d',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '03c9e4f8-5b70-4d2a-4e1f-7c8d9b0a1e25',
    newValue: 'c10eba2d-ff1a-4eab-9285-50481c12a003',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '14d0f5a9-6c81-4e3b-5f2a-8d9e0c1b2f36',
    newValue: 'fadeab4b-79ee-4173-af79-72c51fbad888',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '25e1a6b0-7d92-4f4c-6a3b-9e0f1d2c3a47',
    newValue: '4daf320e-74d0-4f24-a45a-af3a09d741cb',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '36f2b7c1-8e03-4a5d-7b4c-0f1a2e3d4b58',
    newValue: 'ff6b86c1-3112-4dfa-b734-c4789111a716',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '69c5e0f4-1b36-4d8a-0e7f-3c4d5b6a7e81',
    newValue: 'c458ad97-8b95-43de-9003-88eb68576049',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '70d6f1a5-2c47-4e9b-1f8a-4d5e6c7b8f92',
    newValue: '30e9b75a-881f-4a85-aaf1-f2d2464be1cf',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '81e7a2b6-3d58-4f0c-2a9b-5e6f7d8c9003',
    newValue: '898aa202-428f-4a7a-a3b3-8f0a17a6658e',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '92f8b3c7-4e69-4a1d-3b0c-6f7a8e9d0114',
    newValue: 'ec2ebfc9-0c9b-4597-a87d-aa295e2d8bfe',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'a3a9c4d8-5f70-4b2e-4c1d-7a8b9f0e1225',
    newValue: 'dd300c61-f422-467a-91f4-de4f83c4175b',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'b4b0d5e9-6a81-4c3f-5d2e-8b9c0a1f2336',
    newValue: 'c3eb62df-2cc1-4cc3-b7aa-e96a4d65c633',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'c5c1e6f0-7b92-4d4a-6e3f-9c0d1b2a3447',
    newValue: '8e7ca28e-6002-4304-9dcc-0a8da93ca198',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-9b0c-5d6e-7f8a-9b0c1d2e3f4a',
    newValue: '99c330c0-5b7d-4276-a764-aed84499dfb5',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: 'd6d2f7a1-8c03-4e5b-7f4a-0d1e2c3b4558',
    newValue: 'e69f71aa-de0f-4b70-845f-7a8369c47928',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0905c0d4-1f36-4b8e-0c7d-3a4b5f6e788b',
    newValue: '1f360393-a336-435d-966d-8ec2645f875c',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1016d1e5-2a47-4c9f-1d8e-4b5c6a7f899c',
    newValue: 'c0369a13-49bd-48b0-a9f0-6ed0ee8e1b09',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2127e2f6-3b58-4d0a-2e9f-5c6d7b80900d',
    newValue: 'b8e9f696-5be4-48cb-815c-7c0bb8b69d38',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3238f3a7-4c69-4e1b-3f0a-6d7e8c91011e',
    newValue: 'd4f3ef9f-ae24-4cef-9d7a-684a24d4968b',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4349a4b8-5d70-4f2c-4a1b-7e8f9d02122f',
    newValue: 'a257158e-3a89-4715-970c-7fc38ac22370',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '5450b5c9-6e81-4a3d-5b2c-8f90ae132340',
    newValue: 'd55711a3-3297-4fef-beab-48d733712a33',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '6561c6d0-7f92-4b4e-6c3d-90a1bf243451',
    newValue: 'f30c9a75-a563-45a2-93b8-84f59004de8f',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '7672d7e1-8003-4c5f-7d4e-01b2c0354562',
    newValue: 'dca73027-adbe-4078-ae47-8d17850b9f2b',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-c3d4-e5f6-a7b8-901234567890',
    newValue: '9bfc9da7-ae2d-44fd-9563-ede90c5d6222',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0905a0b4-1336-4f8c-0a7b-34e5f3687895',
    newValue: '9bb24d40-60dd-4beb-8c64-a74e8c67f9ee',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1a16b1c5-2447-4a9d-1b8c-45f6a47989a6',
    newValue: '1b86ece8-7ce3-4df3-8771-fd4b5d45b2f2',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-d4e5-f6a7-b8c9-012345678901',
    newValue: '7411cfa3-4fd9-4b90-a636-940015fd7243',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-e5f6-a7b8-c9d0-123456789012',
    newValue: 'b3369d31-3856-4a7a-b007-ee353918127c',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2b38d3e7-5779-4c1f-4e0f-78c9d70d1de9',
    newValue: '8e6038aa-1f79-4a84-87b5-f33caa172e98',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3c49e4f8-6880-4d2a-5f1a-89d0e81e2ef0',
    newValue: '905299c3-ca81-435d-901c-f68b87562516',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4d50f5a9-7991-4e3b-6a2b-90e1f92f3f01',
    newValue: 'a3de1788-5dff-4849-ac5a-0dabe5fab216',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2b27c2d6-3558-4b0e-2c9d-56a7b58a9ab7',
    newValue: 'ab09a386-4dcc-41f7-8dc6-a6071e9c64b7',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-f6a7-b8c9-d0e1-234567890123',
    newValue: 'cce5ce1e-31d0-42e6-83cd-90059244a484',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3c38d3e7-4669-4c1f-3d0e-67b8c69b0bc8',
    newValue: '6217f2a5-28ac-4b88-8a2a-45eee4580e57',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4d49e4f8-5770-4d2a-4e1f-78c9d70c1cd9',
    newValue: 'ab0863ba-f95e-493c-b86c-56e1bc7e5bc2',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '5e50f5a9-6881-4e3b-5f2a-89d0e81d2de0',
    newValue: 'df805c2e-3bfe-4d51-8309-75e5eb4052fe',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '6f61a6b0-7992-4f4c-6a3b-90e1f92e3ef1',
    newValue: 'ce1e3a9e-afe9-439d-abb7-6cc98a6fa405',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '7072b7c1-8003-4a5d-7b4c-01f2a03f4f02',
    newValue: '7a05b45e-7aa6-4a7e-9bbc-299cbed53c96',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0305e0f4-1336-4d8a-0e7f-34c5d36c7c35',
    newValue: '7c069dc0-e83b-4cd5-aaa2-cac7f3e00d80',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1416f1a5-2447-4e9b-1f8a-45d6e47d8d46',
    newValue: '2d83909a-a383-4e82-b00a-8b7739f3f906',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2527a2b6-3558-4f0c-2a9b-56e7f58e9e57',
    newValue: '0d1a59b4-cc87-4b7d-804a-656e8504f371',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3638b3c7-4669-4a1d-3b0c-67f8a69f0f68',
    newValue: 'b8c2a673-a981-4357-a43d-313a358e4daa',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4749c4d8-5770-4b2e-4c1d-78a9b70a1a79',
    newValue: 'e161072d-37b1-477a-b944-ef0d65289574',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '5850d5e9-6881-4c3f-5d2e-89b0c81b2b80',
    newValue: 'ae60d580-b562-44f2-a24d-7b8040063f83',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '6961e6f0-7992-4d4a-6e3f-90c1d92c3c91',
    newValue: 'f53fdd28-a26b-47ba-81b5-6813ad622720',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '7072f7a1-8003-4e5b-7f4a-01d2e03d4d02',
    newValue: '8a265a5c-d3ae-47dc-bdf9-b42cfa2ba639',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0305c0d4-1336-4b8e-0c7d-34a5b36a7a35',
    newValue: 'f48fa3b1-0cec-44da-a9e5-f8a5e766637e',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1416d1e5-2447-4c9f-1d8e-45b6c47b8b46',
    newValue: 'a86b32b3-01d3-4302-a152-8b7f247db7b4',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2527e2f6-3558-4d0a-2e9f-56c7d58c9c57',
    newValue: 'c882f7a4-b025-4d32-aa26-5ef2595bdbf9',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3638f3a7-4669-4e1b-3f0a-67d8e69d0d68',
    newValue: 'b7d305d1-6fae-4ed6-9bdc-354fe9032c0e',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4749a4b8-5770-4f2c-4a1b-78e9f70e1e79',
    newValue: 'c0af54c7-751b-4bb2-b102-677cc4e47402',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '5850b5c9-6881-4a3d-5b2c-89f0a81f2f80',
    newValue: '6942e0ba-90f6-4c33-bf40-7f00b1ec35ab',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '6961c6d0-7992-4b4e-6c3d-90a1b92a3a91',
    newValue: '5e0b2391-85ca-4a66-aef4-52d74245bec2',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '7072d7e1-8003-4c5f-7d4e-01b2c03b4b02',
    newValue: '3e89a914-7bec-47bd-9cf9-743c6b83d001',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0305a0b4-1336-4f8c-0a7b-34e5f36e7e35',
    newValue: '995db1d8-0d3e-40f7-b0eb-5e6897bc9966',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1416b1c5-2447-4a9d-1b8c-45f6a47f8f46',
    newValue: '609cf622-86ef-48d1-812b-e1cab610a46c',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2527c2d6-3558-4b0e-2c9d-56a7b58a9a57',
    newValue: 'd6059ec2-92b0-4cfc-9fd8-78050f03108f',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3638d3e7-4669-4c1f-3d0e-67b8c69b0b68',
    newValue: 'd94329b3-5dc8-4141-ae28-31afe28f7135',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4749e4f8-5770-4d2a-4e1f-78c9d70c1c79',
    newValue: '1a2bd046-7c23-4e0a-9f8a-c3ca3a16d3b9',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '5850f5a9-6881-4e3b-5f2a-89d0e81d2d80',
    newValue: 'e8821da9-728d-470a-bf5b-5a981fff7880',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '6961a6b0-7992-4f4c-6a3b-90e1f92e3e91',
    newValue: 'c7e64c55-eb0c-4b93-b076-5cfcf2e2e042',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '7072b7c1-8003-4a5d-7b4c-01f2a03f4f03',
    newValue: '7331ff89-a3f9-4ac0-9fa9-0de5663ae7b2',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '0305e0f4-1336-4d8a-0e7f-34c5d36c7c36',
    newValue: 'e0ac5ad2-d0c8-4f72-b710-8e53b9dc18d9',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '1416f1a5-2447-4e9b-1f8a-45d6e47d8d47',
    newValue: '8138c3b3-0b14-4ee1-be0e-debdde6b3219',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '2527a2b6-3558-4f0c-2a9b-56e7f58e9e58',
    newValue: '6f3a65eb-2aee-4108-b8a0-c62da419d1dc',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '3638b3c7-4669-4a1d-3b0c-67f8a69f0f69',
    newValue: '76da5f27-523c-44b6-ad06-12954f6b949f',
  },
  {
    table: 'core."indexMetadata"',
    column: '"universalIdentifier"',
    oldValue: '4749c4d8-5770-4b2e-4c1d-78a9b70a1a7a',
    newValue: '8678dde9-a804-4a9e-80e3-9af35e471ec5',
  },
  {
    table: 'core."fieldMetadata"',
    column: '"universalIdentifier"',
    oldValue: '20202020-92d0-1d7f-a126-25ededa6b142',
    newValue: '20202020-1ecc-4562-84c9-ff3a2f6cce85',
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-6155-838a-b64e-44a791fbdc13',
    newValue: STANDARD_SKILL['workflow-building'].universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-e225-f5c7-3d56-45feaa36f2e6',
    newValue: STANDARD_SKILL['data-manipulation'].universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-398f-0d7a-82db-4f43bc7e7044',
    newValue: STANDARD_SKILL['dashboard-building'].universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-c66a-5fed-4a74-46e0b42a6332',
    newValue: STANDARD_SKILL['metadata-building'].universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-db75-4fca-6813-4c7db0f964a0',
    newValue: STANDARD_SKILL.research.universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-5eb9-e775-cf4e-4f22be7be362',
    newValue: STANDARD_SKILL['code-interpreter'].universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-2c7f-5b77-dfa4-494b84752ab7',
    newValue: STANDARD_SKILL.xlsx.universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-c3d1-e0c9-2f93-45648b8bbd26',
    newValue: STANDARD_SKILL.pdf.universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-6f15-2432-0537-4e23a2efd1cb',
    newValue: STANDARD_SKILL.docx.universalIdentifier,
  },
  {
    table: 'core."skill"',
    column: '"universalIdentifier"',
    oldValue: '20202020-c81b-baf8-5255-4c34bd0eac9b',
    newValue: STANDARD_SKILL.pptx.universalIdentifier,
  },
];

@Command({
  name: 'upgrade:1-19:fix-invalid-standard-universal-identifiers',
  description:
    'Fix invalid universalIdentifier values in core tables to comply with UUID v4 format',
})
export class FixInvalidStandardUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options?.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Fixing universal identifiers for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would fix role, agent, skill, and ${STANDARD_OBJECT_MISMATCHES.length} standard object universal identifier mismatches in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      let totalUpdated = 0;

      const roleResult = await queryRunner.query(
        `UPDATE core."role"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_ROLE.admin.universalIdentifier,
          workspaceId,
          OLD_ROLE_ADMIN_UNIVERSAL_IDENTIFIER,
        ],
      );

      const roleUpdatedCount = roleResult?.[1] ?? 0;

      if (roleUpdatedCount > 0) {
        this.logger.log(
          `Updated ${roleUpdatedCount} role universalIdentifier in workspace ${workspaceId}`,
        );
        totalUpdated += roleUpdatedCount;
      }

      const agentResult = await queryRunner.query(
        `UPDATE core."agent"
         SET "universalIdentifier" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = $3`,
        [
          STANDARD_AGENT.helper.universalIdentifier,
          workspaceId,
          OLD_AGENT_HELPER_UNIVERSAL_IDENTIFIER,
        ],
      );

      const agentUpdatedCount = agentResult?.[1] ?? 0;

      if (agentUpdatedCount > 0) {
        this.logger.log(
          `Updated ${agentUpdatedCount} agent universalIdentifier in workspace ${workspaceId}`,
        );
        totalUpdated += agentUpdatedCount;
      }

      const updateCountsByTable: Record<string, number> = {};

      for (const mismatch of STANDARD_OBJECT_MISMATCHES) {
        const result = await queryRunner.query(
          `UPDATE ${mismatch.table}
           SET ${mismatch.column} = $1
           WHERE "workspaceId" = $2
             AND ${mismatch.column} = $3`,
          [mismatch.newValue, workspaceId, mismatch.oldValue],
        );

        const updatedCount = result?.[1] ?? 0;

        if (updatedCount > 0) {
          const tableKey = `${mismatch.table}.${mismatch.column}`;

          updateCountsByTable[tableKey] =
            (updateCountsByTable[tableKey] ?? 0) + updatedCount;
          totalUpdated += updatedCount;
        }
      }

      for (const [tableKey, count] of Object.entries(updateCountsByTable)) {
        this.logger.log(
          `Updated ${count} rows in ${tableKey} for workspace ${workspaceId}`,
        );
      }

      if (totalUpdated === 0) {
        this.logger.log(
          `No universal identifiers needed updating in workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `Updated ${totalUpdated} total universal identifiers in workspace ${workspaceId}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
