import { ServiceFn } from 'src/engine/utils/generics';

export type DeleteTelephonyArgs = {
  id: string;
};

export type DeleteTelephonyHandler = ServiceFn<
  Promise<boolean>,
  DeleteTelephonyArgs
>;
