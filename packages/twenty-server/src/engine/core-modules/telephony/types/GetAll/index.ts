import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { ServiceFn } from 'src/utils/generics';

export type GetAllTelephonyArgs = {
  workspaceId: string;
};

export type GetAllTelephonyHandler = ServiceFn<
  Promise<Telephony[]>,
  GetAllTelephonyArgs
>;
