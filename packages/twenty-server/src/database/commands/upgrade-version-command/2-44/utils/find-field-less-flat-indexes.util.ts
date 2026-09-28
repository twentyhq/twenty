type FieldLessIndexCandidate = {
  flatIndexFieldMetadatas: unknown[];
};

export const findFieldLessFlatIndexes = <
  TFlatIndex extends FieldLessIndexCandidate,
>({
  flatIndexes,
}: {
  flatIndexes: TFlatIndex[];
}): TFlatIndex[] =>
  flatIndexes.filter(
    (flatIndex) => flatIndex.flatIndexFieldMetadatas.length === 0,
  );
