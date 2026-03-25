import { createRequiredContext } from '~/utils/createRequiredContext';

export type SelectableListContextValue = {
  focusId: string;
};

export const [SelectableListContextProvider, useSelectableListContextOrThrow] =
  createRequiredContext<SelectableListContextValue>('SelectableListContext');
