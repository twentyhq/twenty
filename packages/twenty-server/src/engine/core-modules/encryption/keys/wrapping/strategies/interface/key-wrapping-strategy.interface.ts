export interface IKeyWrappingStrategy {
  wrap(keyToWrap: Buffer, wrappingKey: Buffer): Promise<Buffer>;
  unwrap(wrappedKey: Buffer, wrappingKey: Buffer): Promise<Buffer>;
}
