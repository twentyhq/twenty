import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isDefined } from 'twenty-shared/utils';

class ComponentInstanceContextMap {
  constructor() {
    if (!isDefined(window.componentComponentStateContextMap)) {
      window.componentComponentStateContextMap = new Map();
    }
  }

  public get(key: string): ComponentInstanceStateContext<any> | undefined {
    const context = window.componentComponentStateContextMap.get(key);
    return context;
  }

  public set(key: string, context: ComponentInstanceStateContext<any>) {
    window.componentComponentStateContextMap.set(key, context);
  }
}

export const globalComponentInstanceContextMap =
  new ComponentInstanceContextMap();
