import { type CreateForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/create-forwarding-address-input.type';
import { type DeleteForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/delete-forwarding-address-input.type';

export interface EmailForwardingDriverInterface {
  createForwardingAddress(input: CreateForwardingAddressInput): Promise<void>;

  deleteForwardingAddress(input: DeleteForwardingAddressInput): Promise<void>;
}
