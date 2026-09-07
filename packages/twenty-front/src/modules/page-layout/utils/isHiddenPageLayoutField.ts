import { isDefined } from 'twenty-shared/utils';

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
      isDefined(fieldMetadataIdOrName) &&
      hiddenFieldMetadataIdsOrNames.includes(fieldMetadataIdOrName),
  );
