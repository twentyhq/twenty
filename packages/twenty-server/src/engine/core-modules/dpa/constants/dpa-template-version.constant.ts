// Template versioning: every generated/accepted DPA records this version so we
// can prove exactly which text a customer agreed to. Bump BOTH values whenever
// the rendered legal text changes — i.e. when the verbatim template
// (dpa-template.constant.ts) OR the resolved merge-field values
// (dpa-region-config.constant.ts: entities, addresses, governing law, …)
// change, so a given version always maps to one exact rendered agreement.
//
// Format: machine version is sortable (YYYY-MM); the label mirrors the
// "Last Updated" line of the source document and is what we surface to users.
export const DPA_TEMPLATE_VERSION = '2026-06';

export const DPA_LAST_UPDATED_LABEL = 'June 2026';

export const DPA_DOCUMENT_TITLE = 'Twenty Data Processing Agreement (DPA)';
