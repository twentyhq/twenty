import {
  getWhatsappBusinessAccountPhoneNumbers
} from "src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util";

const handler = async (wabaID: string) => {
  const phoneNumbers = await getWhatsappBusinessAccountPhoneNumbers(wabaID);
  for (const phoneNumber of phoneNumbers) {

  }
}