import { atom } from 'jotai';

import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import {
  type ComponentFamilyStateKey,
  type ComponentFamilyStateV2,
} from '@/ui/utilities/state/jotai/types/ComponentFamilyStateV2';
import { isDefined } from 'twenty-shared/utils';

export const createComponentFamilyStateV2 = <ValueType, FamilyKey>({
  key,
  defaultValue,
  componentInstanceContext,
}: {
  key: string;
  defaultValue: ValueType;
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
}): ComponentFamilyStateV2<ValueType, FamilyKey> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  const atomCache = new Map<
    string,
    ReturnType<ComponentFamilyStateV2<ValueType, FamilyKey>['atomFamily']>
  >();

  const familyFunction = ({
    instanceId,
    familyKey,
  }: ComponentFamilyStateKey<FamilyKey>): ReturnType<
    ComponentFamilyStateV2<ValueType, FamilyKey>['atomFamily']
  > => {
    const familyKeyStr =
      typeof familyKey === 'string' ? familyKey : JSON.stringify(familyKey);

    const cacheKey = `${instanceId}__${familyKeyStr}`;
    const existing = atomCache.get(cacheKey);

    if (existing !== undefined) {
      return existing;
    }

    const baseAtom = atom(defaultValue);
    baseAtom.debugLabel = `${key}__${cacheKey}`;
    atomCache.set(cacheKey, baseAtom);

    return baseAtom;
  };

  return {
    type: 'ComponentFamilyStateV2',
    key,
    atomFamily: familyFunction,
  };
};
