import { getComponentStateStorageKey } from '@/page-layout/utils/getComponentStateStorageKey';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type AtomEffect } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const componentLocalStorageEffect = <T>(
  param: ComponentStateKey,
): AtomEffect<T> => {
  return ({ setSelf, onSet, node }) => {
    const instanceId = typeof param === 'string' ? param : param?.instanceId;

    if (!instanceId) {
      return;
    }

    const baseKey = node.key.split('__')[0];

    const storageKey = getComponentStateStorageKey({
      componentStateKey: baseKey,
      instanceId,
    });

    const savedValue = localStorage.getItem(storageKey);

    if (isDefined(savedValue)) {
      try {
        const parsedValue = JSON.parse(savedValue);
        setSelf(parsedValue);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(newValue));
      }
    });
  };
};
