import { installDocumentGetElementById } from '../installDocumentGetElementById';

describe('installDocumentGetElementById', () => {
  it('should delegate to querySelector with an id selector', () => {
    const match = { tagName: 'SPAN' };
    const querySelector = jest.fn().mockReturnValue(match);
    const documentTarget: Record<string, unknown> = { querySelector };

    installDocumentGetElementById(documentTarget);

    expect(
      (documentTarget.getElementById as (id: string) => unknown)('probe'),
    ).toBe(match);
    expect(querySelector).toHaveBeenCalledWith('#probe');
  });

  it('should return null when querySelector finds nothing', () => {
    const documentTarget: Record<string, unknown> = {
      querySelector: () => undefined,
    };

    installDocumentGetElementById(documentTarget);

    expect(
      (documentTarget.getElementById as (id: string) => unknown)('missing'),
    ).toBeNull();
  });

  it('should return null when querySelector throws', () => {
    const documentTarget: Record<string, unknown> = {
      querySelector: () => {
        throw new Error('bad selector');
      },
    };

    installDocumentGetElementById(documentTarget);

    expect(
      (documentTarget.getElementById as (id: string) => unknown)('a b'),
    ).toBeNull();
  });

  it('should not override an existing getElementById', () => {
    const existingGetElementById = jest.fn();
    const documentTarget: Record<string, unknown> = {
      getElementById: existingGetElementById,
      querySelector: jest.fn(),
    };

    installDocumentGetElementById(documentTarget);

    expect(documentTarget.getElementById).toBe(existingGetElementById);
  });
});
