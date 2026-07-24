export const isImportantPriorityKeyword = (priority: string): boolean =>
  priority.trim().toLowerCase() === 'important';
