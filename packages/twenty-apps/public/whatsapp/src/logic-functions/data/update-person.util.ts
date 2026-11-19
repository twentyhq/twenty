import { type CoreApiClient } from 'twenty-client-sdk/core';
import { parseWhatsappPhoneNumber } from 'src/logic-functions/data/parse-whatsapp-phone-number.util';

export const updatePerson = async (client: CoreApiClient, personId: string, message: string, newWaID: string)=> {
  const preparedString = message
    .replace('User ', '')
    .replace('changed from ', '')
    .replace('to ', '')
    .trim()
    .split(' ');
  const formattedNewNumber = parseWhatsappPhoneNumber(
    <string>preparedString[preparedString.length - 1],
  );
  await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: {
          whatsappid: newWaID,
          phones: {
            primaryPhoneCallingCode: formattedNewNumber?.primaryCallingCode,
            primaryPhoneNumber: formattedNewNumber?.primaryPhoneNumber,
          }
        }
      }
    }
  })
}