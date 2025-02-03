import { CreateTelephonyInput } from 'src/engine/core-modules/telephony/inputs';
import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { ServiceFn } from 'src/utils/generics';

export type CreateTelephonyArgs = CreateTelephonyInput;

export type CreateTelephonyResult = Telephony;

export type CreateTelephonyHandler = ServiceFn<
  Promise<CreateTelephonyResult>,
  CreateTelephonyArgs
>;
