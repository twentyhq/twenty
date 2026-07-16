// Layer 1: Search-index exclusion — prohibited fields excluded from searchVector tsvector
export const FIREWALL_SEARCH_EXCLUSION_ENABLED = false;

// Layer 3: AI context allowlist — only explicitly approved fields enter AI context
export const FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED = false;

// Layer 4: Client report and presentation exclusion — leakage scan before sharing
export const FIREWALL_CLIENT_REPORT_SCAN_ENABLED = false;

// Layer 5: Pipeline automation exclusion — stage transitions/workflows can't reference prohibited fields
export const FIREWALL_PIPELINE_EXCLUSION_ENABLED = false;
