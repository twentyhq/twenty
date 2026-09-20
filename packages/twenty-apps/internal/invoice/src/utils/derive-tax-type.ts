export type TaxType = 'INTRA_STATE' | 'INTER_STATE';

// GST split is intra-state (CGST+SGST) when the seller and the place of
// supply are the same state, inter-state (IGST) otherwise. Generic on
// purpose: no state names are hardcoded, this only ever compares the two
// fields against each other.
export const deriveTaxType = (
  sellerState: string | null | undefined,
  placeOfSupply: string | null | undefined,
): TaxType | null => {
  if (!sellerState || !placeOfSupply) {
    return null;
  }

  const normalize = (state: string) => state.trim().toLowerCase();

  return normalize(sellerState) === normalize(placeOfSupply)
    ? 'INTRA_STATE'
    : 'INTER_STATE';
};
