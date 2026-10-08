import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';

export const doesCloneConfigOverrideRef = (
  config: ElementProps | null | undefined,
  readsElementRefFromVnode: boolean,
) => {
  if (config == null) {
    return false;
  }

  if (readsElementRefFromVnode) {
    return !!config.ref;
  }

  return config.ref !== undefined;
};
