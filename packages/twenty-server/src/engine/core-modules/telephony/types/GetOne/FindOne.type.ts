import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { ServiceFn } from 'src/engine/utils/generics';

export type GetOneTelephonyArgs = {
  id: string;
};

export type FindOneTelephonyHandler = ServiceFn<
  Promise<Telephony | null>,
  GetOneTelephonyArgs
>;
