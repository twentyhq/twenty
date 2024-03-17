import { ComponentStateKey, createScopeInternalContext } from 'twenty-ui';

type ViewScopeInternalContextProps = ComponentStateKey;

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
