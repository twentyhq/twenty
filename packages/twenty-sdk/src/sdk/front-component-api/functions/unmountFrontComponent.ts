import { isDefined } from 'twenty-shared/utils';

type UnmountFrontComponentFunction = () => Promise<void>;

const UNMOUNT_FRONT_COMPONENT_KEY =
  '__twentySdkUnmountFrontComponentFunction__';

export const setUnmountFrontComponent = (
  fn: UnmountFrontComponentFunction,
): void => {
  (globalThis as Record<string, unknown>)[UNMOUNT_FRONT_COMPONENT_KEY] = fn;
};

export const unmountFrontComponent: UnmountFrontComponentFunction =
  (): Promise<void> => {
    const unmountFrontComponentFunction = (
      globalThis as Record<string, unknown>
    )[UNMOUNT_FRONT_COMPONENT_KEY] as UnmountFrontComponentFunction | undefined;

    if (!isDefined(unmountFrontComponentFunction)) {
      throw new Error('unmountFrontComponentFunction is not set');
    }

    return unmountFrontComponentFunction();
  };
