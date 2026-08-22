export function extractNodes<T>(connection: { edges: { node: T }[] }): T[] {
  return connection.edges.map(edge => edge.node);
}