import { CoreApiClient } from 'twenty-client-sdk/core';

import { type WhatsappPersonRecord } from 'src/types/whatsapp-person-record.type';

const CALLING_CODE_MAX_DIGITS = 3;

const getDigits = (value: string | null | undefined): string =>
  (value ?? '').replace(/\D/g, '');

// Twenty stores the calling code apart from the number, and its length is unknown here
const getStoredNumberCandidates = (digits: string): string[] =>
  Array.from({ length: CALLING_CODE_MAX_DIGITS + 1 }, (_, callingCodeLength) =>
    digits.slice(callingCodeLength),
  );

const hasPhone = (person: WhatsappPersonRecord, digits: string): boolean =>
  [
    {
      callingCode: person.phones?.primaryPhoneCallingCode,
      number: person.phones?.primaryPhoneNumber,
    },
    ...(person.phones?.additionalPhones ?? []),
  ].some(
    ({ callingCode, number }) =>
      getDigits(callingCode) + getDigits(number) === digits,
  );

export const findPersonIdsByWhatsappPhone = async (
  handle: string,
): Promise<string[]> => {
  const digits = getDigits(handle);
  const storedNumberCandidates = getStoredNumberCandidates(digits);

  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: {
        filter: {
          or: [
            { phones: { primaryPhoneNumber: { in: storedNumberCandidates } } },
            ...storedNumberCandidates.map((storedNumber) => ({
              phones: { additionalPhones: { like: `%"${storedNumber}"%` } },
            })),
          ],
        },
        first: 50,
      },
      edges: {
        node: {
          id: true,
          phones: {
            primaryPhoneNumber: true,
            primaryPhoneCallingCode: true,
            additionalPhones: { number: true, callingCode: true },
          },
        },
      },
    },
  });

  return (people?.edges ?? [])
    .map((edge: { node: WhatsappPersonRecord }) => edge.node)
    .filter((person: WhatsappPersonRecord) => hasPhone(person, digits))
    .map((person: WhatsappPersonRecord) => person.id);
};
