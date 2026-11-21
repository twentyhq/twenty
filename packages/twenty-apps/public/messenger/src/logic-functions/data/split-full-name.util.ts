import { type PersonName } from 'src/logic-functions/types/person-name.type';

export const splitFullName = (fullName: string): PersonName | undefined => {
  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);

  return firstName === undefined || firstName.length === 0
    ? undefined
    : { firstName, lastName: lastNameParts.join(' ') };
};
