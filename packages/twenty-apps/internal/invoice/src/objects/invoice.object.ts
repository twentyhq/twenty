import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  CGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  CLIENT_GSTIN_FIELD_UNIVERSAL_IDENTIFIER,
  DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  HSN_SAC_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  IGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_UNIVERSAL_IDENTIFIER,
  PLACE_OF_SUPPLY_FIELD_UNIVERSAL_IDENTIFIER,
  SELLER_GSTIN_FIELD_UNIVERSAL_IDENTIFIER,
  SELLER_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  SGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  STATUS_OPTION_OVERDUE_ID,
  STATUS_OPTION_PAID_ID,
  STATUS_OPTION_UNPAID_ID,
  TAXABLE_VALUE_FIELD_UNIVERSAL_IDENTIFIER,
  TAX_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  TAX_TYPE_OPTION_INTER_STATE_ID,
  TAX_TYPE_OPTION_INTRA_STATE_ID,
} from 'src/constants/universal-identifiers';

// GST requires sequential invoice numbers, so the invoice number (not a
// generic "name") is the object's label-identifier field.
enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

// Derived by the on-invoice-created/updated logic functions from
// sellerState vs. placeOfSupply — see src/utils/derive-tax-type.ts.
// Editable manually too; the logic functions only correct it after a
// sellerState/placeOfSupply change.
enum TaxType {
  INTRA_STATE = 'INTRA_STATE',
  INTER_STATE = 'INTER_STATE',
}

export default defineObject({
  universalIdentifier: INVOICE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'invoice',
  namePlural: 'invoices',
  labelSingular: 'Invoice',
  labelPlural: 'Invoices',
  description: 'A GST-compliant client invoice.',
  icon: 'IconFileInvoice',
  labelIdentifierFieldMetadataUniversalIdentifier:
    INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: INVOICE_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'invoiceNumber',
      label: 'Invoice number',
      description: 'Sequential invoice number, required by GST.',
      icon: 'IconHash',
    },
    {
      universalIdentifier: AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      icon: 'IconCurrencyRupee',
    },
    {
      universalIdentifier: DUE_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'dueDate',
      label: 'Due date',
      icon: 'IconCalendarDue',
    },
    {
      universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${InvoiceStatus.UNPAID}'`,
      options: [
        {
          id: STATUS_OPTION_UNPAID_ID,
          value: InvoiceStatus.UNPAID,
          label: 'Unpaid',
          position: 0,
          color: 'orange',
        },
        {
          id: STATUS_OPTION_PAID_ID,
          value: InvoiceStatus.PAID,
          label: 'Paid',
          position: 1,
          color: 'green',
        },
        {
          id: STATUS_OPTION_OVERDUE_ID,
          value: InvoiceStatus.OVERDUE,
          label: 'Overdue',
          position: 2,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: SELLER_GSTIN_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sellerGstin',
      label: 'Seller GSTIN',
      description: "The agency's own GSTIN on this invoice.",
      icon: 'IconId',
    },
    {
      universalIdentifier: CLIENT_GSTIN_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'clientGstin',
      label: 'Client GSTIN',
      icon: 'IconId',
      isNullable: true,
    },
    {
      universalIdentifier: HSN_SAC_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'hsnSacCode',
      label: 'HSN/SAC code',
      icon: 'IconBarcode',
    },
    {
      universalIdentifier: TAXABLE_VALUE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'taxableValue',
      label: 'Taxable value',
      icon: 'IconCurrencyRupee',
    },
    {
      universalIdentifier: SELLER_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sellerState',
      label: 'Seller state',
      description:
        "The agency's registered state for this invoice. Compared against place of supply to determine intra-state (CGST+SGST) vs. inter-state (IGST).",
      icon: 'IconMapPin',
    },
    {
      universalIdentifier: PLACE_OF_SUPPLY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'placeOfSupply',
      label: 'Place of supply',
      icon: 'IconMapPin',
    },
    {
      universalIdentifier: TAX_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'taxType',
      label: 'Tax type',
      description:
        'Intra-state (CGST+SGST) or inter-state (IGST), derived from seller state vs. place of supply.',
      icon: 'IconReceiptTax',
      isNullable: true,
      options: [
        {
          id: TAX_TYPE_OPTION_INTRA_STATE_ID,
          value: TaxType.INTRA_STATE,
          label: 'Intra-state (CGST+SGST)',
          position: 0,
          color: 'blue',
        },
        {
          id: TAX_TYPE_OPTION_INTER_STATE_ID,
          value: TaxType.INTER_STATE,
          label: 'Inter-state (IGST)',
          position: 1,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: CGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'cgstAmount',
      label: 'CGST amount',
      icon: 'IconCurrencyRupee',
      isNullable: true,
    },
    {
      universalIdentifier: SGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'sgstAmount',
      label: 'SGST amount',
      icon: 'IconCurrencyRupee',
      isNullable: true,
    },
    {
      universalIdentifier: IGST_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'igstAmount',
      label: 'IGST amount',
      icon: 'IconCurrencyRupee',
      isNullable: true,
    },
  ],
});
