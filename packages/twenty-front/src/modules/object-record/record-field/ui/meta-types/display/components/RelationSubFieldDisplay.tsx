// OMNIA-CUSTOM: Displays a sub-field value from a related record.
// Used when a ViewField has subFieldName set (e.g., "Lead / Date of Birth").

import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import { isDefined } from 'twenty-shared/utils';

export const RelationSubFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const subFieldName = (
    fieldDefinition.metadata as Record<string, unknown>
  ).subFieldName as string | undefined;

  const relationFieldName = fieldDefinition.metadata.fieldName;

  // Get the related object (e.g., record.lead = { id, dateOfBirth, ... })
  const relatedObject = useRecordFieldValue<Record<string, unknown> | null>(
    recordId,
    relationFieldName,
    fieldDefinition,
  );

  if (!isDefined(relatedObject) || !subFieldName) {
    return <TextDisplay text="" />;
  }

  const rawValue = relatedObject[subFieldName];

  // Format composite field types
  const displayValue = formatSubFieldValue(rawValue);

  return <TextDisplay text={displayValue} />;
};

/**
 * Formats a sub-field value for display.
 * Handles composite types (FULL_NAME, PHONES, EMAILS, ADDRESS, CURRENCY)
 * by extracting the most useful display value.
 */
function formatSubFieldValue(value: unknown): string {
  if (!isDefined(value)) return '';

  // Primitive types
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value !== 'object' || value === null) return '';

  const obj = value as Record<string, unknown>;

  // FULL_NAME: { firstName, lastName }
  if ('firstName' in obj || 'lastName' in obj) {
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
  }

  // PHONES: { primaryPhoneNumber, primaryPhoneCountryCode }
  if ('primaryPhoneNumber' in obj) {
    return String(obj.primaryPhoneNumber ?? '');
  }

  // EMAILS: { primaryEmail }
  if ('primaryEmail' in obj) {
    return String(obj.primaryEmail ?? '');
  }

  // ADDRESS: { addressStreet1, addressCity, addressState, addressPostcode }
  if ('addressStreet1' in obj || 'addressCity' in obj) {
    return [
      obj.addressStreet1,
      obj.addressStreet2,
      obj.addressCity,
      obj.addressState,
      obj.addressPostcode,
    ]
      .filter(Boolean)
      .join(', ');
  }

  // CURRENCY: { amountMicros, currencyCode }
  if ('amountMicros' in obj) {
    const micros = Number(obj.amountMicros ?? 0);

    if (micros === 0) return '';

    const amount = micros / 1_000_000;

    return `${amount.toFixed(2)}`;
  }

  // LINKS: { primaryLinkUrl }
  if ('primaryLinkUrl' in obj) {
    return String(obj.primaryLinkUrl ?? '');
  }

  // Fallback: try to stringify
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}
