export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
