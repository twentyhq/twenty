// How a DPA record came to exist:
//  - CLICK_THROUGH: accepted by reference at signup (acceptance = execution),
//    fields resolved from the workspace region. No signing UI.
//  - SIGNED: generated in-app (Settings → Legal → Generate DPA), pre-signed by
//    Twenty with a customer-entered legal entity + authorized signatory, stored
//    as an executed PDF against the workspace.
export enum DpaAgreementType {
  CLICK_THROUGH = 'CLICK_THROUGH',
  SIGNED = 'SIGNED',
}
