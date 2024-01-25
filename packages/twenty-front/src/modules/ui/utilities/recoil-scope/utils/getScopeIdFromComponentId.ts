import { getScopeIdFromComponentIdStrict } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentIdStrict';

export const getScopeIdFromComponentId = (componentId?: string) =>
  componentId ? getScopeIdFromComponentIdStrict(componentId) : undefined;
