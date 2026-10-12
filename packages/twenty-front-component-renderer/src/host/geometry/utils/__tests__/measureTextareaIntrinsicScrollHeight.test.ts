import { measureTextareaIntrinsicScrollHeight } from '../measureTextareaIntrinsicScrollHeight';

describe('measureTextareaIntrinsicScrollHeight', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should keep ordinary textareas outside intrinsic measurements', () => {
    const textarea = document.createElement('textarea');
    const append = jest.spyOn(document.body, 'append');

    expect(measureTextareaIntrinsicScrollHeight(textarea)).toBeUndefined();
    expect(append).not.toHaveBeenCalled();
  });

  it('should measure current content without mutating the source textarea', () => {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('data-auto-resize', 'true');
    textarea.value = 'First\nSecond\nThird';
    textarea.rows = 1;
    textarea.style.blockSize = '130px';
    textarea.style.width = '240px';
    textarea.style.padding = '8px';
    let measuredTextarea: HTMLTextAreaElement | null = null;
    jest
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: Element) {
        measuredTextarea = this as HTMLTextAreaElement;
        return 64;
      });

    const scrollHeight = measureTextareaIntrinsicScrollHeight(textarea);

    expect(scrollHeight).toBe(64);
    expect(textarea.style.blockSize).toBe('130px');
    expect(measuredTextarea).toHaveProperty('value', 'First\nSecond\nThird');
    expect(measuredTextarea).toHaveProperty('rows', 1);
    expect(measuredTextarea).toHaveProperty('style.blockSize', 'auto');
    expect(measuredTextarea).toHaveProperty('style.width', '240px');
    expect(measuredTextarea).toHaveProperty('isConnected', false);
  });

  it('should refresh intrinsic height when rendered metrics change without a value or style update', () => {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('data-auto-resize', 'true');
    textarea.value = 'First\nSecond\nThird';
    textarea.style.width = '240px';
    jest
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockReturnValueOnce(64)
      .mockReturnValueOnce(96);

    expect(measureTextareaIntrinsicScrollHeight(textarea)).toBe(64);
    expect(measureTextareaIntrinsicScrollHeight(textarea)).toBe(96);
  });

  it('should remove the measurement textarea after a layout read fails', () => {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('data-auto-resize', 'true');
    const initialChildCount = document.body.childElementCount;
    jest
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockImplementation(() => {
        throw new Error('Layout failed');
      });

    expect(() => measureTextareaIntrinsicScrollHeight(textarea)).toThrow(
      'Layout failed',
    );
    expect(document.body.childElementCount).toBe(initialChildCount);
  });
});
