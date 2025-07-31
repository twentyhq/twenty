import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { isDefined } from 'twenty-shared/utils';

declare global {
  interface Window {
    componentComponentStateContextMap: Map<
      string,
      ComponentInstanceStateContext<any>
    >;
  }
}

class ComponentInstanceContextMap {
  constructor() {
    if (!isDefined(window.componentComponentStateContextMap)) {
      window.componentComponentStateContextMap = new Map();
    }
  }

  public get(key: string): ComponentInstanceStateContext<any> {
    const context = window.componentComponentStateContextMap.get(key);
    if (!context) {
      throw new Error(`Context for key "${key}" is not defined`);
    }
    return context;
  }

  public set(key: string, context: ComponentInstanceStateContext<any>) {
    window.componentComponentStateContextMap.set(key, context);
  }
}

export const globalComponentInstanceContextMap =
  new ComponentInstanceContextMap();
