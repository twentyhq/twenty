import { ComponentStateKey, createScopeInternalContext } from 'twenty-ui';

type RelationPickerScopeInternalContextProps = ComponentStateKey;

export const RelationPickerScopeInternalContext =
  createScopeInternalContext<RelationPickerScopeInternalContextProps>();
