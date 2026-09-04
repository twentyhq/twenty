import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceMemberNumberFormatEnum } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const WORKSPACE_MEMBER_NUMBER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.numberFormat.universalIdentifier;

export const NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION: FieldMetadataComplexOption =
  {
    id: '20202020-6458-416d-8bdf-b667697e54c3',
    value: WorkspaceMemberNumberFormatEnum.NO_GROUPING,
    label: 'No spacing',
    position: 5,
    color: 'gray',
  };

export const buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations = ({
  existingFlatFieldMetadataMaps,
  now,
}: {
  existingFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): FlatEntityToCreateDeleteUpdate<'fieldMetadata'> => {
  const numberFormatField =
    existingFlatFieldMetadataMaps.byUniversalIdentifier[
      WORKSPACE_MEMBER_NUMBER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER
    ];

  const existingOptions = (numberFormatField?.options ??
    []) as FieldMetadataComplexOption[];

  const noGroupingOptionIsMissing =
    numberFormatField?.type === FieldMetadataType.SELECT &&
    !existingOptions.some(
      (option) =>
        option.id === NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION.id,
    );

  if (!noGroupingOptionIsMissing) {
    return {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    };
  }

  return {
    flatEntityToCreate: [],
    flatEntityToDelete: [],
    flatEntityToUpdate: [
      {
        ...numberFormatField,
        options: [
          ...existingOptions,
          NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION,
        ],
        updatedAt: now,
      },
    ],
  };
};
