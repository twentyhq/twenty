export const updateAppBadge = async (count: number) => {
  if (!('setAppBadge' in navigator)) {
    return;
  }

  if (count > 0) {
    await navigator.setAppBadge(count);
  } else {
    await navigator.clearAppBadge();
  }
};
