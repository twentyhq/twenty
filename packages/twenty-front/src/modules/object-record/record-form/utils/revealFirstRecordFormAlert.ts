export const revealFirstRecordFormAlert = ({
  containerId,
}: {
  containerId: string;
}) => {
  const container = document.getElementById(containerId);
  const activeElement = document.activeElement;

  // Some inputs only show their error once left, e.g. when submitting with a shortcut
  if (
    activeElement instanceof HTMLElement &&
    container?.contains(activeElement)
  ) {
    activeElement.blur();
  }

  requestAnimationFrame(() =>
    container
      ?.querySelector('[role="alert"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
  );
};
