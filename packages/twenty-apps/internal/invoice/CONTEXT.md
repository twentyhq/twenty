# Invoicing

GST-compliant client billing, modeled as a custom Invoice object on top of Twenty CRM's standard People/Company objects.

## Language

**Invoice**:
A GST-compliant record of an amount owed by a client, identified by its sequential invoice number rather than a generic name.
_Avoid_: Bill.

**Tax type**:
Whether an invoice's GST is Intra-state (CGST+SGST) or Inter-state (IGST). Derived automatically by comparing Seller state against Place of supply — never set from a hardcoded state value.
_Avoid_: GST type, tax split.

**Seller state**:
The agency's own registered state on a given invoice. One half of the Tax type comparison.

**Place of supply**:
The client's state for GST purposes on a given invoice. The other half of the Tax type comparison.
_Avoid_: Client state.

**Client contact / Client company**:
The two ways an Invoice can reference who owes the money — a Person (individual client) or a Company (business client), never both meaningfully at once. Mirrors Twenty's own Opportunity object, which relates to a Person (`pointOfContact`) and a Company the same way.
