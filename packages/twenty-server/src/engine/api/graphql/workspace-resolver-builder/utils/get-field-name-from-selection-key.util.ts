import { SELECTION_KEY_SEPARATOR } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-key-separator';

export const getFieldNameFromSelectionKey = (selectionKey: string): string =>
  selectionKey.split(SELECTION_KEY_SEPARATOR)[0];
