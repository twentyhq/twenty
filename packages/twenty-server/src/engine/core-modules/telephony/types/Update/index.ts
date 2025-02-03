import { UpdateTelephonyInput } from 'src/engine/core-modules/telephony/inputs';
import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { ServiceFn } from 'src/engine/utils/generics';

export type UpdateTelephonyArgs = {
  id: string;
  data: UpdateTelephonyInput;
};

export type UpdateTelephonyResult = Telephony;

export type UpdateTelephonyHandler = ServiceFn<
  Promise<UpdateTelephonyResult>,
  UpdateTelephonyArgs
>;
