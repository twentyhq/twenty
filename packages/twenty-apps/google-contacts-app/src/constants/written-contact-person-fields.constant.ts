export const WRITTEN_CONTACT_PERSON_FIELDS = 'names,emailAddresses';

// Sent as the update mask on every export: Google clears whatever a masked
// field omits, which is how a value cleared in Twenty clears in Google.
export const TWENTY_OWNED_CONTACT_PERSON_FIELDS =
  'names,emailAddresses,phoneNumbers,organizations,urls';
