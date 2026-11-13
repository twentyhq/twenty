import { findInactiveFieldMetadataOptionValues } from 'src/engine/core-modules/application/application-manifest/utils/find-inactive-field-metadata-option-values.util';
import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';

const FIELD_UID = '33333333-3333-4333-8333-333333333333';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_APP_UID = '22222222-2222-4222-8222-222222222222';
const ACTIVE_OPTION_UID = '77777777-7777-4777-8777-777777777771';
const DEACTIVATED_OPTION_UID = '77777777-7777-4777-8777-777777777772';

const existingFlatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [ACTIVE_OPTION_UID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: ACTIVE_OPTION_UID,
      fieldMetadataUniversalIdentifier: FIELD_UID,
      applicationUniversalIdentifier: APP_UID,
      value: 'OPEN',
      position: 0,
    }),
    [DEACTIVATED_OPTION_UID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: DEACTIVATED_OPTION_UID,
      fieldMetadataUniversalIdentifier: FIELD_UID,
      applicationUniversalIdentifier: APP_UID,
      value: 'PAUSED',
      position: 1,
      overrides: { [WORKSPACE_APP_UID]: { isActive: false } },
    }),
  },
};

describe('findInactiveFieldMetadataOptionValues', () => {
  it('should return the value of a workspace-deactivated option', () => {
    expect(
      findInactiveFieldMetadataOptionValues({
        fieldMetadataUniversalIdentifier: FIELD_UID,
        existingFlatFieldMetadataOptionMaps,
        incomingFlatFieldMetadataOptionMaps:
          existingFlatFieldMetadataOptionMaps,
      }),
    ).toEqual(new Set(['PAUSED']));
  });

  it('should return the incoming value of a deactivated option the app renames', () => {
    expect(
      findInactiveFieldMetadataOptionValues({
        fieldMetadataUniversalIdentifier: FIELD_UID,
        existingFlatFieldMetadataOptionMaps,
        incomingFlatFieldMetadataOptionMaps: {
          byUniversalIdentifier: {
            [DEACTIVATED_OPTION_UID]: getFlatFieldMetadataOptionMock({
              universalIdentifier: DEACTIVATED_OPTION_UID,
              fieldMetadataUniversalIdentifier: FIELD_UID,
              value: 'ON_HOLD',
              position: 1,
            }),
          },
        },
      }),
    ).toEqual(new Set(['ON_HOLD']));
  });
});
