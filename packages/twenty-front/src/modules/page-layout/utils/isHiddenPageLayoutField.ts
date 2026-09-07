type IsHiddenPageLayoutFieldParams = {
  fieldMetadataIdsOrNames: (string | undefined)[];
  hiddenFieldMetadataIdsOrNames: string[];
};

export const isHiddenPageLayoutField = ({
  fieldMetadataIdsOrNames,
  hiddenFieldMetadataIdsOrNames,
}: IsHiddenPageLayoutFieldParams) =>
  fieldMetadataIdsOrNames.some(
    (fieldMetadataIdOrName) =>
      fieldMetadataIdOrName !== undefined &&
      hiddenFieldMetadataIdsOrNames.includes(fieldMetadataIdOrName),
  );
