import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

type FieldLessIndexCandidate = Pick<FlatIndexMetadata, 'name'> & {
  flatIndexFieldMetadatas: unknown[];
};

// An index whose fields were all deleted keeps its metadata row, and that name
// blocks any new index with the same deterministic name. Names still used by an
// index that has fields are skipped, so the live index keeps its metadata.
export const findFieldLessFlatIndexes = <
  TFlatIndex extends FieldLessIndexCandidate,
>({
  flatIndexes,
}: {
  flatIndexes: TFlatIndex[];
}): TFlatIndex[] => {
  const namesOfIndexesWithFields = new Set(
    flatIndexes
      .filter((flatIndex) => flatIndex.flatIndexFieldMetadatas.length > 0)
      .map((flatIndex) => flatIndex.name),
  );

  return flatIndexes.filter(
    (flatIndex) =>
      flatIndex.flatIndexFieldMetadatas.length === 0 &&
      !namesOfIndexesWithFields.has(flatIndex.name),
  );
};
