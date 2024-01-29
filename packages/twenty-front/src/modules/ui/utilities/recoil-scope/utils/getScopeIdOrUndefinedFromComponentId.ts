import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

export const getScopeIdOrUndefinedFromComponentId = (componentId?: string) =>
  componentId ? getScopeIdFromComponentId(componentId) : undefined;
