type CountableBlock = {
  children?: CountableBlock[];
};

export const countBlocksDeep = (blocks: CountableBlock[] | undefined): number =>
  (blocks ?? []).reduce(
    (total, block) => total + 1 + countBlocksDeep(block.children),
    0,
  );
