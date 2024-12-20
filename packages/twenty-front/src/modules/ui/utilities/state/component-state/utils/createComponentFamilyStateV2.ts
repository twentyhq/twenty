import { ComponentFamilyStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKeyV2';
import { ComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateV2';
import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import {
  AtomEffect,
  atomFamily,
  Loadable,
  RecoilValue,
  SerializableParam,
  WrappedValue,
} from 'recoil';

import { isDefined } from 'twenty-ui';

type CreateComponentFamilyStateArgs<
  ValueType,
  FamilyKey extends SerializableParam,
> = {
  key: string;
  defaultValue:
    | ValueType
    | ((
        param: ComponentFamilyStateKeyV2<FamilyKey>,
      ) =>
        | ValueType
        | RecoilValue<ValueType>
        | Promise<ValueType>
        | Loadable<ValueType>
        | WrappedValue<ValueType>);
  componentInstanceContext: ComponentInstanceStateContext<any> | null;
  effects?:
    | AtomEffect<ValueType>[]
    | ((
        param: ComponentFamilyStateKeyV2<FamilyKey>,
      ) => ReadonlyArray<AtomEffect<ValueType>>);
};

export const createComponentFamilyStateV2 = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  effects,
  defaultValue,
  componentInstanceContext,
}: CreateComponentFamilyStateArgs<
  ValueType,
  FamilyKey
>): ComponentFamilyStateV2<ValueType, FamilyKey> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  return {
    type: 'ComponentFamilyState',
    key,
    atomFamily: atomFamily<ValueType, ComponentFamilyStateKeyV2<FamilyKey>>({
      key,
      default: defaultValue,
      effects,
    }),
  } satisfies ComponentFamilyStateV2<ValueType, FamilyKey>;
};
