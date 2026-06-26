// The kind of a rendered DPA block, exposed over GraphQL so clients can
// discriminate blocks (heading vs paragraph vs signature field) with type safety.
// Values mirror the domain union DpaResolvedBlock['kind'].
export enum DpaDocumentBlockKind {
  Heading = 'heading',
  Paragraph = 'paragraph',
  SignatureField = 'signatureField',
}
