import { getComponentStateStorageKey } from '@/page-layout/utils/getComponentStateStorageKey';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type AtomEffect } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const componentLocalStorageEffect =
  <T>(): AtomEffect<T> =>
  ({ setSelf, onSet, node }) => {
    const param = (node as any).param as ComponentStateKey;

    const instanceId = typeof param === 'string' ? param : param?.instanceId;

    if (!instanceId) {
      return;
    }

    const storageKey = getComponentStateStorageKey({
      componentStateKey: node.key,
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
