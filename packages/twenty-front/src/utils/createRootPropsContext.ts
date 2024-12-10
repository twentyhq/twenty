import { createRequiredContext } from '~/utils/create-required-context';

type RootProps = Record<string, any>;

export type RootPropsContext<T extends RootProps> = T extends RootProps
  ? T
  : never;

export const createRootPropsContext = <T extends RootProps>(name: string) =>
  createRequiredContext<RootPropsContext<T>>(name);
