import { z } from 'zod';

export const UuidValueSchema = z.uuidv4();
export const UuidValueOptionalSchema = UuidValueSchema.optional();

export const LinksValueSchema = z.object({
  primaryLinkLabel: z.string().optional(),
  primaryLinkUrl: z.string().url().optional(),
  secondaryLinks: z
    .array(
      z.object({
        url: z.string().url(),
        label: z.string(),
      }),
    )
    .optional(),
});
export const LinksValueOptionalSchema = LinksValueSchema.optional();

const CURRENCY_WRITE_DESCRIPTION =
  'Currency amount in micros (1 unit = 1,000,000 micros). Multiply the user-provided amount by 1,000,000 before writing.';
const CURRENCY_READ_DESCRIPTION =
  'Currency amount in micros (1 unit = 1,000,000 micros). Divide by 1,000,000 to display to users.';

export const CurrencyValueSchema = z.object({
  amountMicros: z.number().optional().describe(CURRENCY_WRITE_DESCRIPTION),
  currencyCode: z.string().optional(),
});
export const CurrencyValueOptionalSchema = CurrencyValueSchema.optional();

export const CurrencyResponseValueSchema = z.object({
  amountMicros: z.number().optional().describe(CURRENCY_READ_DESCRIPTION),
  currencyCode: z.string().optional(),
});
export const CurrencyResponseValueOptionalSchema =
  CurrencyResponseValueSchema.optional();

export const FullNameValueSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
export const FullNameValueOptionalSchema = FullNameValueSchema.optional();

export const AddressValueSchema = z.object({
  addressStreet1: z.string().optional(),
  addressStreet2: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostcode: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.string().optional(),
  addressLat: z.number().optional(),
  addressLng: z.number().optional(),
});
export const AddressValueOptionalSchema = AddressValueSchema.optional();

export const EmailsValueSchema = z.object({
  primaryEmail: z.string().email().optional(),
  additionalEmails: z.array(z.string().email()).optional(),
});
export const EmailsValueOptionalSchema = EmailsValueSchema.optional();

export const PhonesValueSchema = z.object({
  primaryPhoneNumber: z.string().optional(),
  primaryPhoneCountryCode: z.string().optional(),
  primaryPhoneCallingCode: z.string().optional(),
  additionalPhones: z.array(z.string()).optional(),
});
export const PhonesValueOptionalSchema = PhonesValueSchema.optional();

export const RichTextValueSchema = z.object({
  markdown: z.string().optional(),
  blocknote: z.string().optional(),
});
export const RichTextValueOptionalSchema = RichTextValueSchema.optional();
