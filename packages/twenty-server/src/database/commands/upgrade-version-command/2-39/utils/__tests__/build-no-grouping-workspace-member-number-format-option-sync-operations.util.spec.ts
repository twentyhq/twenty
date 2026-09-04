import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import {
  buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations,
  NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION,
} from 'src/database/commands/upgrade-version-command/2-39/utils/build-no-grouping-workspace-member-number-format-option-sync-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceMemberNumberFormatEnum } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NUMBER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.fields.numberFormat.universalIdentifier;
const NOW = '2026-09-04T00:00:00.000Z';

const buildNumberFormatOption = (
  value: WorkspaceMemberNumberFormatEnum,
  position: number,
): FieldMetadataComplexOption => ({
  id: `option-${value}`,
  value,
  label: value,
  position,
  color: 'gray',
});

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildNumberFormatField = (options: FieldMetadataComplexOption[]) =>
  getFlatFieldMetadataMock({
    universalIdentifier: NUMBER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: 'workspace-member-object-id',
    type: FieldMetadataType.SELECT,
    options,
  });

describe('buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations', () => {
  it('appends the No spacing option without changing existing options', () => {
    const numberFormatField = buildNumberFormatField([
      buildNumberFormatOption(WorkspaceMemberNumberFormatEnum.SYSTEM, 0),
      buildNumberFormatOption(
        WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT,
        1,
      ),
      buildNumberFormatOption(
        WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA,
        2,
      ),
      buildNumberFormatOption(
        WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA,
        3,
      ),
      buildNumberFormatOption(
        WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT,
        4,
      ),
    ]);

    const { flatEntityToUpdate } =
      buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations({
        existingFlatFieldMetadataMaps:
          buildFlatFieldMetadataMaps([numberFormatField]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(1);
    expect(flatEntityToUpdate[0]).toMatchObject({
      universalIdentifier: NUMBER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER,
      updatedAt: NOW,
      options: [
        ...(numberFormatField.options as FieldMetadataComplexOption[]),
        NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION,
      ],
    });
  });

  it('does nothing when the No spacing option is already present', () => {
    const numberFormatField = buildNumberFormatField([
      buildNumberFormatOption(WorkspaceMemberNumberFormatEnum.SYSTEM, 0),
      NO_GROUPING_WORKSPACE_MEMBER_NUMBER_FORMAT_OPTION,
    ]);

    const { flatEntityToUpdate } =
      buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations({
        existingFlatFieldMetadataMaps:
          buildFlatFieldMetadataMaps([numberFormatField]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(0);
  });

  it('does nothing when the workspace has no number format field', () => {
    const { flatEntityToUpdate } =
      buildNoGroupingWorkspaceMemberNumberFormatOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps([]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(0);
  });
});
