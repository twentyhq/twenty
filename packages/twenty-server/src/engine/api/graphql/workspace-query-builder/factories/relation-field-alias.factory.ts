import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';
import { getFieldArgumentsByKey } from 'src/engine/api/graphql/workspace-query-builder/utils/get-field-arguments-by-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsStringFactory } from './args-string.factory';

@Injectable()
export class RelationFieldAliasFactory {
  private logger = new Logger(RelationFieldAliasFactory.name);

  constructor(
    @Inject(forwardRef(() => FieldsStringFactory))
    private readonly fieldsStringFactory: CircularDep<FieldsStringFactory>,
    private readonly argsStringFactory: ArgsStringFactory,
  ) {}

  create(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    objectMetadataCollection: ObjectMetadataInterface[],
    info: GraphQLResolveInfo,
    withSoftDeleted?: boolean,
  ): Promise<string> {
    if (!isRelationFieldMetadataType(fieldMetadata.type)) {
      throw new Error(`Field ${fieldMetadata.name} is not a relation field`);
    }

    return this.createRelationAlias(
      fieldKey,
      fieldValue,
      fieldMetadata,
      objectMetadataCollection,
      info,
      withSoftDeleted,
    );
  }

  private async createRelationAlias(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    objectMetadataCollection: ObjectMetadataInterface[],
    info: GraphQLResolveInfo,
    withSoftDeleted?: boolean,
  ): Promise<string> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    if (!relationMetadata) {
      throw new Error(
        `Relation metadata not found for field ${fieldMetadata.name}`,
      );
    }

    if (!fieldMetadata.workspaceId) {
      throw new Error(
        `Workspace id not found for field ${fieldMetadata.name} in object metadata ${fieldMetadata.objectMetadataId}`,
      );
    }

    const relationDirection = deduceRelationDirection(
      fieldMetadata,
      relationMetadata,
    );
    // Retrieve the referenced object metadata based on the relation direction
    // Mandatory to handle n+n relations
    const referencedObjectMetadata = objectMetadataCollection.find(
      (objectMetadata) =>
        objectMetadata.id ===
        (relationDirection == RelationDirection.TO
          ? relationMetadata.fromObjectMetadataId
          : relationMetadata.toObjectMetadataId),
    );

    if (!referencedObjectMetadata) {
      throw new Error(
        `Referenced object metadata not found for relation ${relationMetadata.id}`,
      );
    }

    // If it's a relation destination is of kind MANY, we need to add the collection suffix and extract the args
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY &&
      relationDirection === RelationDirection.FROM
    ) {
      const args = getFieldArgumentsByKey(info, fieldKey);

      // If the referenced object is soft deletable, we need to filter out the deleted objects
      if (!withSoftDeleted && referencedObjectMetadata.isSoftDeletable) {
        args.filter = {
          deletedAt: { is: 'NULL' },
          ...args.filter,
        };
      }

      const argsString = this.argsStringFactory.create(
        args,
        referencedObjectMetadata.fields ?? [],
        !withSoftDeleted && !!referencedObjectMetadata.isSoftDeletable,
      );
      const fieldsString =
        await this.fieldsStringFactory.createFieldsStringRecursive(
          info,
          fieldValue,
          referencedObjectMetadata.fields ?? [],
          objectMetadataCollection,
          withSoftDeleted ?? false,
        );

      return `
        ${fieldKey}: ${computeObjectTargetTable(
          referencedObjectMetadata,
        )}Collection${argsString ? `(${argsString})` : ''} {
          ${fieldsString}
        }
      `;
    }

    let relationAlias = `${fieldKey}: ${computeColumnName(fieldMetadata)}`;

    // For one to one relations, pg_graphql use the target TableName on the side that is not storing the foreign key
    // so we need to alias it to the field key
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE &&
      relationDirection === RelationDirection.FROM
    ) {
      relationAlias = `${fieldKey}: ${computeObjectTargetTable(
        referencedObjectMetadata,
      )}`;
    }
    const fieldsString =
      await this.fieldsStringFactory.createFieldsStringRecursive(
        info,
        fieldValue,
        referencedObjectMetadata.fields ?? [],
        objectMetadataCollection,
        withSoftDeleted ?? false,
      );

    // Otherwise it means it's a relation destination is of kind ONE
    return `
      ${relationAlias} {
        ${fieldsString}
      }
    `;
  }
}
