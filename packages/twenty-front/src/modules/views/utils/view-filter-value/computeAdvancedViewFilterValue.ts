import { ImmutableTree, Utils } from '@react-awesome-query-builder/ui';

export const computeAdvancedViewFilterValue = (immutableTree: ImmutableTree) =>
  JSON.stringify(Utils.getTree(immutableTree));
