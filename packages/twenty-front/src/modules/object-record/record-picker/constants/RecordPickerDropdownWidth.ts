// [STRATUM-PATCH] Default width for record-picker dropdown frames.
// Upstream defaults MultipleRecordPicker/SingleRecordPicker to
// GenericDropdownContentWidth.Medium (200px), which is too narrow for lists of
// tag/record names. Callers that don't pass an explicit width now fall back to
// this wider default.
export const RECORD_PICKER_DROPDOWN_WIDTH = 400;
