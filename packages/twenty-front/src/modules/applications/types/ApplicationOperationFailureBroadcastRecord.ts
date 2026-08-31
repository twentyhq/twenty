export type ApplicationOperation = 'install' | 'upgrade' | 'uninstall';

// Payload of the applicationOperationFailure broadcast event, emitted when an
// enqueued install, upgrade or uninstall fails after the mutation returned.
export type ApplicationOperationFailureBroadcastRecord = {
  universalIdentifier: string;
  operation: ApplicationOperation;
  applicationName?: string;
};
