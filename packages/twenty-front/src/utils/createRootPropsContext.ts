import { Context, createContext } from 'react';

type RootProps = Record<string, any>;

export type RootPropsContext<T extends RootProps> = T extends RootProps
  ? T
  : never;

export const createRootPropsContext = <T extends RootProps>(): Context<
  RootPropsContext<T>
> => createContext<RootPropsContext<T>>({} as RootPropsContext<T>);
