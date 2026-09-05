import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { collectRecordShareStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-39/utils/collect-record-share-standard-universal-identifiers.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('collectRecordShareStandardUniversalIdentifiers', () => {
  const { allFlatEntityMaps: standardAllFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: v4(),
      twentyStandardApplicationId: v4(),
    });

  const universalIdentifiers = collectRecordShareStandardUniversalIdentifiers(
    { standardAllFlatEntityMaps },
  );

  it('should collect the recordShare standard object only', () => {
    expect(universalIdentifiers.objectMetadata).toEqual([
      STANDARD_OBJECTS.recordShare.universalIdentifier,
    ]);
  });

  it('should collect every recordShare field declared in twenty-shared', () => {
    const declaredFieldUniversalIdentifiers = Object.values(
      STANDARD_OBJECTS.recordShare.fields,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers.fieldMetadata).toHaveLength(
      declaredFieldUniversalIdentifiers.length,
    );
    expect(universalIdentifiers.fieldMetadata).toEqual(
      expect.arrayContaining(declaredFieldUniversalIdentifiers),
    );
  });

  it('should collect every recordShare index declared in twenty-shared', () => {
    const declaredIndexUniversalIdentifiers = Object.values(
      STANDARD_OBJECTS.recordShare.indexes,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers.index).toHaveLength(
      declaredIndexUniversalIdentifiers.length,
    );
    expect(universalIdentifiers.index).toEqual(
      expect.arrayContaining(declaredIndexUniversalIdentifiers),
    );
  });

  it('should not collect metadata belonging to unrelated standard objects', () => {
    const companyFieldUniversalIdentifiers = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataUniversalIdentifier ===
          STANDARD_OBJECTS.company.universalIdentifier,
      )
      .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

    expect(companyFieldUniversalIdentifiers.length).toBeGreaterThan(0);
    expect(universalIdentifiers.fieldMetadata).toEqual(
      expect.not.arrayContaining(companyFieldUniversalIdentifiers),
    );
  });
});
