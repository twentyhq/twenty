export type ClassAttributeTargetElement = {
  getAttribute: (attributeName: string) => string | null;
  setAttribute: (attributeName: string, attributeValue: string) => void;
};
