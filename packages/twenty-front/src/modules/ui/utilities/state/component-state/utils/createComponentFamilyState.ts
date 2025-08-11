import { type ComponentFamilyState } from '@/ui/utilities/state/component-state/types/ComponentFamilyState';
import { type ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';
import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import {
  type AtomEffect,
  atomFamily,
  type Loadable,
  type RecoilValue,
  type SerializableParam,
  type WrappedValue,
} from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type CreateComponentFamilyStateArgs<
  ValueType,
  FamilyKey extends SerializableParam,
> = {
  key: string;
  defaultValue:
    | ValueType
    | ((
        param: ComponentFamilyStateKey<FamilyKey>,
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
        param: ComponentFamilyStateKey<FamilyKey>,
      ) => ReadonlyArray<AtomEffect<ValueType>>);
};

export const createComponentFamilyState = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  effects,
  defaultValue,
  componentInstanceContext,
}: CreateComponentFamilyStateArgs<ValueType, FamilyKey>): ComponentFamilyState<
  ValueType,
  FamilyKey
> => {
  if (isDefined(componentInstanceContext)) {
    globalComponentInstanceContextMap.set(key, componentInstanceContext);
  }

  return {
    type: 'ComponentFamilyState',
    key,
    atomFamily: atomFamily<ValueType, ComponentFamilyStateKey<FamilyKey>>({
      key,
      default: defaultValue,
      effects,
    }),
  } satisfies ComponentFamilyState<ValueType, FamilyKey>;
};
