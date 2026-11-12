import {
  computeCustomFieldMetadataOptionMarks,
  type EnumFieldToMark,
  type OptionRowToMark,
} from 'src/database/commands/upgrade-version-command/2-58/utils/compute-custom-field-metadata-option-marks.util';

const STANDARD_APPLICATION_ID = '20202020-0000-4000-8000-0000000000aa';
const WORKSPACE_CUSTOM_APPLICATION_ID = '20202020-0000-4000-8000-0000000000bb';
const OTHER_APPLICATION_ID = '20202020-0000-4000-8000-0000000000cc';
const STAGE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';

const buildField = ({
  id,
  applicationId,
  optionValues,
}: {
  id: string;
  applicationId: string;
  optionValues: string[];
}): EnumFieldToMark => ({
  id,
  universalIdentifier:
    id === 'stage' ? STAGE_FIELD_UNIVERSAL_IDENTIFIER : `${id}-universal`,
  applicationId,
  options: optionValues.map((value, position) => ({
    id: `${id}-${value}`,
    value,
    label: value,
    color: 'green',
    position,
  })),
});

const buildOptionRow = ({
  fieldMetadataId,
  value,
  applicationId,
}: {
  fieldMetadataId: string;
  value: string;
  applicationId: string;
}): OptionRowToMark => ({
  id: `row-${fieldMetadataId}-${value}`,
  universalIdentifier: `${fieldMetadataId}-${value}`,
  fieldMetadataId,
  applicationId,
  value,
});

const computeMarks = ({
  enumFields,
  optionRows,
}: {
  enumFields: EnumFieldToMark[];
  optionRows: OptionRowToMark[];
}) =>
  computeCustomFieldMetadataOptionMarks({
    enumFields,
    optionRows,
    standardOptionValuesByFieldUniversalIdentifier: new Map([
      [STAGE_FIELD_UNIVERSAL_IDENTIFIER, new Set(['NEW', 'WON'])],
    ]),
    twentyStandardApplicationId: STANDARD_APPLICATION_ID,
  });

describe('computeCustomFieldMetadataOptionMarks', () => {
  it('moves and marks the option a workspace added to a standard field before rows had owners', () => {
    const { optionRowIdsToMoveToWorkspaceCustomApplication, optionsToRewriteByFieldMetadataId } =
      computeMarks({
        enumFields: [
          buildField({
            id: 'stage',
            applicationId: STANDARD_APPLICATION_ID,
            optionValues: ['NEW', 'WON', 'PARTNER_REVIEW'],
          }),
        ],
        optionRows: ['NEW', 'WON', 'PARTNER_REVIEW'].map((value) =>
          buildOptionRow({
            fieldMetadataId: 'stage',
            value,
            applicationId: STANDARD_APPLICATION_ID,
          }),
        ),
      });

    expect(optionRowIdsToMoveToWorkspaceCustomApplication).toEqual([
      'row-stage-PARTNER_REVIEW',
    ]);
    expect(
      optionsToRewriteByFieldMetadataId
        .get('stage')
        ?.map(({ value, isCustom }) => [value, isCustom]),
    ).toEqual([
      ['NEW', undefined],
      ['WON', undefined],
      ['PARTNER_REVIEW', true],
    ]);
  });

  it("marks the option a workspace owns on another application's field without moving it", () => {
    const { optionRowIdsToMoveToWorkspaceCustomApplication, optionsToRewriteByFieldMetadataId } =
      computeMarks({
        enumFields: [
          buildField({
            id: 'status',
            applicationId: OTHER_APPLICATION_ID,
            optionValues: ['OPEN', 'ARCHIVED'],
          }),
        ],
        optionRows: [
          buildOptionRow({
            fieldMetadataId: 'status',
            value: 'OPEN',
            applicationId: OTHER_APPLICATION_ID,
          }),
          buildOptionRow({
            fieldMetadataId: 'status',
            value: 'ARCHIVED',
            applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          }),
        ],
      });

    expect(optionRowIdsToMoveToWorkspaceCustomApplication).toEqual([]);
    expect(
      optionsToRewriteByFieldMetadataId
        .get('status')
        ?.map(({ value, isCustom }) => [value, isCustom]),
    ).toEqual([
      ['OPEN', undefined],
      ['ARCHIVED', true],
    ]);
  });

  it("leaves the workspace's own fields and untouched standard fields alone", () => {
    const { optionRowIdsToMoveToWorkspaceCustomApplication, optionsToRewriteByFieldMetadataId } =
      computeMarks({
        enumFields: [
          buildField({
            id: 'stage',
            applicationId: STANDARD_APPLICATION_ID,
            optionValues: ['NEW', 'WON'],
          }),
          buildField({
            id: 'priority',
            applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
            optionValues: ['LOW', 'HIGH'],
          }),
        ],
        optionRows: [
          ...['NEW', 'WON'].map((value) =>
            buildOptionRow({
              fieldMetadataId: 'stage',
              value,
              applicationId: STANDARD_APPLICATION_ID,
            }),
          ),
          ...['LOW', 'HIGH'].map((value) =>
            buildOptionRow({
              fieldMetadataId: 'priority',
              value,
              applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
            }),
          ),
        ],
      });

    expect(optionRowIdsToMoveToWorkspaceCustomApplication).toEqual([]);
    expect(optionsToRewriteByFieldMetadataId.size).toBe(0);
  });
});
