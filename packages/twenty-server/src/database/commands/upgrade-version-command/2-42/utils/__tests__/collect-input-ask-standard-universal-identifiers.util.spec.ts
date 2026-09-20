import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { collectInputAskStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-42/utils/collect-input-ask-standard-universal-identifiers.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('collectInputAskStandardUniversalIdentifiers', () => {
  const { allFlatEntityMaps: standardAllFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: v4(),
      twentyStandardApplicationId: v4(),
    });

  const universalIdentifiers = collectInputAskStandardUniversalIdentifiers({
    standardAllFlatEntityMaps,
  });

  it('should collect the inputAsk standard object only', () => {
    expect(universalIdentifiers.objectMetadata).toEqual([
      STANDARD_OBJECTS.inputAsk.universalIdentifier,
    ]);
  });

  it('should collect every inputAsk field declared in twenty-shared', () => {
    const declaredFieldUniversalIdentifiers = Object.values(
      STANDARD_OBJECTS.inputAsk.fields,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers.fieldMetadata).toEqual(
      expect.arrayContaining(declaredFieldUniversalIdentifiers),
    );
  });

  it('should collect the inverse relation fields living on the other objects', () => {
    expect(universalIdentifiers.fieldMetadata).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.workflowRun.fields.inputAsks.universalIdentifier,
        STANDARD_OBJECTS.workspaceMember.fields.inputAsks.universalIdentifier,
      ]),
    );
  });

  it('should collect every inputAsk index declared in twenty-shared', () => {
    const declaredIndexUniversalIdentifiers = Object.values(
      STANDARD_OBJECTS.inputAsk.indexes,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers.index).toEqual(
      expect.arrayContaining(declaredIndexUniversalIdentifiers),
    );
  });

  it('should collect every inputAsk view declared in twenty-shared', () => {
    const declaredViewUniversalIdentifiers = Object.values(
      STANDARD_OBJECTS.inputAsk.views,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers.view).toHaveLength(
      declaredViewUniversalIdentifiers.length,
    );
    expect(universalIdentifiers.view).toEqual(
      expect.arrayContaining(declaredViewUniversalIdentifiers),
    );
    expect(universalIdentifiers.viewField.length).toBeGreaterThan(0);
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
