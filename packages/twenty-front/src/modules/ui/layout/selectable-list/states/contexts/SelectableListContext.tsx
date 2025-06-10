import { createRequiredContext } from '~/utils/createRequiredContext';

export type SelectableListContextValue = {
  hotkeyScope: string;
};

export const [SelectableListContextProvider, useSelectableListContextOrThrow] =
  createRequiredContext<SelectableListContextValue>('SelectableListContext');
