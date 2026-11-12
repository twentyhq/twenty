import { isDefined } from 'twenty-shared/utils';

export type StandardEnumField = {
  id: string;
  universalIdentifier: string;
};

export type StandardOptionRow = {
  id: string;
  fieldMetadataId: string;
  value: string;
};

// The 2.57 backfill gave every option row its field's application, so a workspace addition is a value the standard field does not declare.
export const findWorkspaceAddedStandardOptionRowIds = ({
  standardEnumFields,
  standardOptionRows,
  standardOptionValuesByFieldUniversalIdentifier,
}: {
  standardEnumFields: StandardEnumField[];
  standardOptionRows: StandardOptionRow[];
  standardOptionValuesByFieldUniversalIdentifier: Map<string, Set<string>>;
}): string[] => {
  const standardOptionValuesByFieldMetadataId = new Map(
    standardEnumFields.map((standardEnumField) => [
      standardEnumField.id,
      standardOptionValuesByFieldUniversalIdentifier.get(
        standardEnumField.universalIdentifier,
      ),
    ]),
  );

  return standardOptionRows
    .filter((standardOptionRow) => {
      const standardOptionValues = standardOptionValuesByFieldMetadataId.get(
        standardOptionRow.fieldMetadataId,
      );

      return (
        isDefined(standardOptionValues) &&
        !standardOptionValues.has(standardOptionRow.value)
      );
    })
    .map(({ id }) => id);
};
