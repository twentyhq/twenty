export const scrollToFirstRecordFormAlert = ({
  containerId,
}: {
  containerId: string;
}) =>
  document
    .getElementById(containerId)
    ?.querySelector('[role="alert"]')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
