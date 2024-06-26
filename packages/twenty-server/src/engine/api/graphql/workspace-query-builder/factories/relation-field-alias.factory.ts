import { forwardRef, Inject, Injectable } from '@nestjs/common';

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
import { FieldIsNotRelationException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/field-is-not-relation.exception';
import { FieldHasNoWorkspaceIdException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/field-has-no-workspace-id.exception';
import { RelationHasNoObjectException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/relation-has-no-object.exception';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsStringFactory } from './args-string.factory';

@Injectable()
export class RelationFieldAliasFactory {
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
  ): Promise<string> {
    if (!isRelationFieldMetadataType(fieldMetadata.type)) {
      throw new FieldIsNotRelationException(fieldMetadata.name);
    }

    return this.createRelationAlias(
      fieldKey,
      fieldValue,
      fieldMetadata,
      objectMetadataCollection,
      info,
    );
  }

  private async createRelationAlias(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    objectMetadataCollection: ObjectMetadataInterface[],
    info: GraphQLResolveInfo,
  ): Promise<string> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    if (!relationMetadata) {
      throw new FieldIsNotRelationException(fieldMetadata.name);
    }

    if (!fieldMetadata.workspaceId) {
      throw new FieldHasNoWorkspaceIdException(fieldMetadata.id);
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
      throw new RelationHasNoObjectException(relationMetadata.id);
    }

    // If it's a relation destination is of kind MANY, we need to add the collection suffix and extract the args
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY &&
      relationDirection === RelationDirection.FROM
    ) {
      const args = getFieldArgumentsByKey(info, fieldKey);
      const argsString = this.argsStringFactory.create(
        args,
        referencedObjectMetadata.fields ?? [],
      );
      const fieldsString =
        await this.fieldsStringFactory.createFieldsStringRecursive(
          info,
          fieldValue,
          referencedObjectMetadata.fields ?? [],
          objectMetadataCollection,
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
      );

    // Otherwise it means it's a relation destination is of kind ONE
    return `
      ${relationAlias} {
        ${fieldsString}
      }
    `;
  }
}
