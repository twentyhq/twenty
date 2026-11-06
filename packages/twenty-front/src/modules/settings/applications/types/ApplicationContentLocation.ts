export type ApplicationContentLocation =
  | { kind: 'installed'; applicationId: string }
  | { kind: 'marketplace'; availableApplicationId: string };
