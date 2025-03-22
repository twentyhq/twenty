import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isDefined } from 'twenty-shared/utils';

class ComponentInstanceContextMap {
  constructor() {
    if (!isDefined((window as any).componentComponentStateContextMap)) {
      (window as any).componentComponentStateContextMap = new Map();
    }
  }

  public get(key: string): ComponentInstanceStateContext<any> {
    return (window as any).componentComponentStateContextMap.get(key);
  }

  public set(key: string, context: ComponentInstanceStateContext<any>) {
    (window as any).componentComponentStateContextMap.set(key, context);
  }
}

export const globalComponentInstanceContextMap =
  new ComponentInstanceContextMap();
