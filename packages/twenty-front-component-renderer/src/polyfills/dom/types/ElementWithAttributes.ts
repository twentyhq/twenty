export type ElementWithAttributes = {
  getAttribute: (attributeName: string) => string | null;
  setAttribute: (attributeName: string, attributeValue: string) => void;
  removeAttribute: (attributeName: string) => void;
};
