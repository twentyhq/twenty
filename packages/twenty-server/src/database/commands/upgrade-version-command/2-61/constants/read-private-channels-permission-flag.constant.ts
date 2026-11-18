// Frozen copy of the standard definition, so later catalog changes can't alter what this command creates
export const READ_PRIVATE_CHANNELS_PERMISSION_FLAG = {
  key: 'READ_PRIVATE_CHANNELS',
  universalIdentifier: 'a0b3ee37-a031-50ff-8092-a3653cdfeeec',
  label: 'Read Private Channel Info',
  description:
    "Read the address, owner and account status of every member's channels, not their messages or events",
  icon: 'IconAt',
  permissionType: 'settings',
} as const;
