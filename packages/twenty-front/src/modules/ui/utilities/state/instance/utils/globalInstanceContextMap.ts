import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';
import { isDefined } from 'twenty-ui';

class InstanceContextMap {
  constructor() {
    if (!isDefined((window as any).instanceStateContextMap)) {
      (window as any).instanceStateContextMap = new Map();
    }
  }

  public get(key: string): InstanceStateContext<any> {
    return (window as any).instanceStateContextMap.get(key);
  }

  public set(key: string, context: InstanceStateContext<any>) {
    (window as any).instanceStateContextMap.set(key, context);
  }
}

export const globalInstanceContextMap = new InstanceContextMap();
