import { findWorkspaceAddedStandardOptionRowIds } from 'src/database/commands/upgrade-version-command/2-59/utils/find-workspace-added-standard-option-row-ids.util';

const STAGE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';

const buildStandardOptionRow = ({
  fieldMetadataId,
  value,
}: {
  fieldMetadataId: string;
  value: string;
}) => ({ id: `row-${fieldMetadataId}-${value}`, fieldMetadataId, value });

describe('findWorkspaceAddedStandardOptionRowIds', () => {
  it('returns the standard-owned rows whose value the standard field does not declare', () => {
    expect(
      findWorkspaceAddedStandardOptionRowIds({
        standardEnumFields: [
          { id: 'stage', universalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER },
        ],
        standardOptionRows: ['NEW', 'WON', 'PARTNER_REVIEW'].map((value) =>
          buildStandardOptionRow({ fieldMetadataId: 'stage', value }),
        ),
        standardOptionValuesByFieldUniversalIdentifier: new Map([
          [STAGE_FIELD_UNIVERSAL_IDENTIFIER, new Set(['NEW', 'WON'])],
        ]),
      }),
    ).toEqual(['row-stage-PARTNER_REVIEW']);
  });

  it('leaves the rows of a field the standard application no longer declares', () => {
    expect(
      findWorkspaceAddedStandardOptionRowIds({
        standardEnumFields: [
          { id: 'legacy', universalIdentifier: 'legacy-universal-identifier' },
        ],
        standardOptionRows: [
          buildStandardOptionRow({ fieldMetadataId: 'legacy', value: 'OLD' }),
        ],
        standardOptionValuesByFieldUniversalIdentifier: new Map([
          [STAGE_FIELD_UNIVERSAL_IDENTIFIER, new Set(['NEW', 'WON'])],
        ]),
      }),
    ).toEqual([]);
  });
});
