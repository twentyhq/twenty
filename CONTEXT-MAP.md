# Context Map

JAI OS is built on top of a Twenty CRM fork. Most of `packages/*` is stock upstream Twenty and is not modeled here — see its own `CLAUDE.md`. Contexts below are JAI-OS's own additions only.

## Contexts

- [Invoicing](./packages/twenty-apps/internal/invoice/CONTEXT.md): the GST-compliant Invoice object and its tax-type derivation, built as a Twenty Apps-framework app.

## Relationships

- **Invoicing → Twenty CRM standard objects**: an Invoice relates to a client via `clientContact` (Person) or `clientCompany` (Company), mirroring how Twenty's own Opportunity object relates to both.
