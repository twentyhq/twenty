import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedCompanyFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/company';
import { SeedPersonFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/person';
import { SeedFavoriteFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/favorite';
import { SeedAttachmentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/attachment';
import { SeedOpportunityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/opportunity';
import { SeedActivityTargetFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/activity-target';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'relationMetadata';

export const seedCompanyRelationMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'relationType',
      'fromObjectMetadataId',
      'toObjectMetadataId',
      'fromFieldMetadataId',
      'toFieldMetadataId',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Company,
        toObjectMetadataId: SeedObjectMetadataIds.Person,
        fromFieldMetadataId: SeedCompanyFieldMetadataIds.People,
        toFieldMetadataId: SeedPersonFieldMetadataIds.Company,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Company,
        toObjectMetadataId: SeedObjectMetadataIds.Favorite,
        fromFieldMetadataId: SeedCompanyFieldMetadataIds.Favorites,
        toFieldMetadataId: SeedFavoriteFieldMetadataIds.Company,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Company,
        toObjectMetadataId: SeedObjectMetadataIds.Attachment,
        fromFieldMetadataId: SeedCompanyFieldMetadataIds.Attachments,
        toFieldMetadataId: SeedAttachmentFieldMetadataIds.Company,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Company,
        toObjectMetadataId: SeedObjectMetadataIds.Opportunity,
        fromFieldMetadataId: SeedCompanyFieldMetadataIds.Opportunities,
        toFieldMetadataId: SeedOpportunityFieldMetadataIds.Company,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Company,
        toObjectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        fromFieldMetadataId: SeedCompanyFieldMetadataIds.ActivityTargets,
        toFieldMetadataId: SeedActivityTargetFieldMetadataIds.Company,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
