export type ClassListTargetElement = {
  getAttribute: (attributeName: string) => string | null;
  setAttribute: (attributeName: string, attributeValue: string) => void;
  className?: unknown;
};
