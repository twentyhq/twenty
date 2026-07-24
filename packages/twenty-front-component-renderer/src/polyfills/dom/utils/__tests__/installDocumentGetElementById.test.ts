import { installDocumentGetElementById } from '../installDocumentGetElementById';

type FakeNode = {
  childNodes: FakeNode[];
  getAttribute?: (attributeName: string) => string | null;
};

const createElementNode = (elementId?: string): FakeNode => ({
  childNodes: [],
  getAttribute: (attributeName: string) =>
    attributeName === 'id' && elementId !== undefined ? elementId : null,
});

type InstalledDocument = FakeNode & {
  getElementById: (elementId: string) => FakeNode | null;
};

const createDocumentTarget = (): InstalledDocument => {
  const documentTarget: FakeNode = { childNodes: [] };
  installDocumentGetElementById(documentTarget);

  return documentTarget as InstalledDocument;
};

describe('installDocumentGetElementById', () => {
  it('should find a nested element by id', () => {
    const documentTarget = createDocumentTarget();
    const parent = createElementNode();
    const target = createElementNode('probe');

    documentTarget.childNodes.push(parent);
    parent.childNodes.push(target);

    expect(documentTarget.getElementById('probe')).toBe(target);
  });

  it('should return null when no element matches', () => {
    const documentTarget = createDocumentTarget();
    documentTarget.childNodes.push(createElementNode('other'));

    expect(documentTarget.getElementById('missing')).toBeNull();
  });

  it('should return null for an empty id even when an element has an empty id attribute', () => {
    const documentTarget = createDocumentTarget();
    documentTarget.childNodes.push(createElementNode(''));

    expect(documentTarget.getElementById('')).toBeNull();
  });

  it('should find an id containing css selector characters', () => {
    const documentTarget = createDocumentTarget();
    const target = createElementNode('foo.bar:baz');
    documentTarget.childNodes.push(target);

    expect(documentTarget.getElementById('foo.bar:baz')).toBe(target);
  });

  it('should skip nodes without attributes', () => {
    const documentTarget = createDocumentTarget();
    const textLikeNode = { childNodes: [] } as FakeNode;
    const target = createElementNode('probe');

    documentTarget.childNodes.push(textLikeNode, target);

    expect(documentTarget.getElementById('probe')).toBe(target);
  });

  it('should not override an existing getElementById', () => {
    const existingGetElementById = jest.fn();
    const documentTarget = {
      childNodes: [],
      getElementById: existingGetElementById,
    };

    installDocumentGetElementById(documentTarget);

    expect(documentTarget.getElementById).toBe(existingGetElementById);
  });
});
