export const findFirstDivergingAncestorIndex = ({
  firstChain,
  secondChain,
}: {
  firstChain: object[];
  secondChain: object[];
}): number => {
  let index = 0;

  while (
    index < firstChain.length &&
    index < secondChain.length &&
    firstChain[index] === secondChain[index]
  ) {
    index += 1;
  }

  return index;
};
