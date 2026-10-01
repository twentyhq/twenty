export const getSelectDropdownInitialFocus = (
  dropdownContent: HTMLElement | null,
) =>
  dropdownContent?.querySelector<HTMLElement>(
    '[data-dropdown-item][aria-pressed="true"]:not([aria-disabled="true"])',
  ) ??
  dropdownContent?.querySelector<HTMLElement>(
    '[data-dropdown-item]:not([aria-disabled="true"])',
  ) ??
  true;
