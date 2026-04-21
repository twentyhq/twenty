// [STRATUM-PATCH] Max height for record-picker dropdown lists.
// Upstream shares DROPDOWN_MENU_ITEMS_CONTAINER_MAX_HEIGHT (168px) across every
// dropdown in the app, which leaves relation/tag picker lists cramped. This
// constant is passed explicitly at record-picker call sites so the change does
// not leak into status selects, icon pickers, etc.
export const RECORD_PICKER_DROPDOWN_MAX_HEIGHT = 320;
