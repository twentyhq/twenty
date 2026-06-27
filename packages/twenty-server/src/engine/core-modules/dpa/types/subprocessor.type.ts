// A single Sub-Processor entry, mirrored from Twenty's Trust Center (OneLeet).
// The canonical list lives at https://trust.twenty.com; subprocessors.json is
// synced from it by scripts/dpa-sync-subprocessors.ts (see the "DPA
// Sub-Processor Sync" GitHub Action). Never hand-edit the JSON — edit the Trust
// Center instead so there is a single source of truth.
export type Subprocessor = {
  name: string;
  // Free-text description of what the Sub-Processor processes/stores, verbatim
  // from the Trust Center (an array there; rendered joined).
  services: string[];
  // ISO 3166-1 alpha-2 country codes of the processing location(s).
  processingLocations: string[];
  processesPii: boolean;
  // Public website; omitted when the Trust Center has none.
  vendorUrl?: string;
};

export type SubprocessorList = {
  subprocessors: Subprocessor[];
};
