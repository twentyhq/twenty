// Synced into subprocessors.json from the Trust Center; do not hand-edit the JSON.
export type Subprocessor = {
  name: string;
  services: string[];
  processingLocations: string[];
  processesPii: boolean;
  vendorUrl?: string;
};

export type SubprocessorList = {
  subprocessors: Subprocessor[];
};
