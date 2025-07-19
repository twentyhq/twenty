export interface KeyWrappingStrategyInterface {
  wrap(keyToWrap: Buffer, wrappingKey: Buffer): Promise<Buffer>;
  unwrap(wrappedKey: Buffer, wrappingKey: Buffer): Promise<Buffer>;
}
