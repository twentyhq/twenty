type GetIndexNeighboursElementsFromArrayArgs = {
  index: number;
  array: string[];
};
type GetIndexNeighboursElementsFromArrayReturnType = {
  before?: string;
  after?: string;
};
export const getIndexNeighboursElementsFromArray = ({
  index,
  array,
}: GetIndexNeighboursElementsFromArrayArgs): GetIndexNeighboursElementsFromArrayReturnType => {
  if (index === 0) {
    return {
      after: array.at(0),
    };
  }

  if (index >= array.length) {
    return {
      before: array.at(-1),
    };
  }

  return {
    before: array.at(index - 1),
    after: array.at(index),
  };
};
