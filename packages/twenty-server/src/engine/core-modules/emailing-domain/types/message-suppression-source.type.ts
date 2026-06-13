// Values are frozen into the core enum type once shipped (Postgres enums can
// add values later but not drop them) — only keep sources that have a writer.
export enum MessageSuppressionSource {
  WEBHOOK = 'WEBHOOK',
  SYSTEM = 'SYSTEM',
}
