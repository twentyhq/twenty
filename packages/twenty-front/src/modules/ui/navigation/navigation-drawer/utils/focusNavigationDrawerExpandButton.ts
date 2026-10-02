export const focusNavigationDrawerExpandButton = () => {
  document
    .querySelector<HTMLElement>('[data-navigation-drawer-expand-button]')
    ?.focus();
};
