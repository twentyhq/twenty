// Shape of the `after` payload broadcast by the server when SDK client
// generation persists a new core checksum on the application row. The
// application entity is not part of the syncable metadata system, so this
// payload is not a generated GraphQL type.
//
// Only the core checksum is broadcast: the metadata checksum is instance-wide
// and served fresh by the frontComponent resolver, so it never travels through
// this event.
export type ApplicationSdkClientChecksumsBroadcastRecord = {
  id: string;
  sdkClientCoreChecksum?: string | null;
};
