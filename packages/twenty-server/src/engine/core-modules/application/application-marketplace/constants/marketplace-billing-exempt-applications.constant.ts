// First-party background polling and per-record import events must not drain
// credits while idle. Explicit recording charges and AI usage remain billable.
export const MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS: string[] = [
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  '66a504cc-0a75-410e-a43f-cdeae1db1522',
  '8bdaaa9f-dc53-4247-a89b-aa386c9b3244',
];
