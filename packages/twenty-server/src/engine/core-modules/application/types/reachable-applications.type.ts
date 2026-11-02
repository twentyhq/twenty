export type ReachableApplications =
  | { type: 'all' }
  | { type: 'own'; applicationId: string };
