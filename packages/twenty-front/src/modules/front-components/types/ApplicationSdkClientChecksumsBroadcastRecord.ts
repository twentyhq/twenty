// Shape of the `after` payload broadcast by the server when SDK client
// generation persists new checksums on the application row. The application
// entity is not part of the syncable metadata system, so this payload is not
// a generated GraphQL type.
export type ApplicationSdkClientChecksumsBroadcastRecord = {
  id: string;
  sdkClientCoreChecksum?: string | null;
  sdkClientMetadataChecksum?: string | null;
};
